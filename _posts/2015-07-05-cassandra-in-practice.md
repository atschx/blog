---
author: Albert
date: 2015-07-05
layout: post
title: Cassandra 实战：从需求到落地
categories: tech
permalink: /tech/2015/07/05/cassandra-in-practice.html
display_date: 2015-07-05
---

## 一、逼上梁山

> [<<IM场景下的系统拓扑及协议优化>>]({{ site.baseurl }}/tech/2015/07/01/im-topology-and-protocol-statistic.html)中留下一个问题:存储交互的每条协议,按大小排序给出Top N ?

首先这个问题其实有两层含义:

1. 如何存 ? (除了高效的写,还要有足够的容量)
2. 排序给出Top N ? (即使样本再大,也要排序给出结果)

最简单的办法:`mysql中创建一张表,order by bytes desc limit N`.这是所有程序员都能想到的`短平快`的办法,**然并卵**.有人说,用Hadoop吧.可目前的需求用Hadoop解决有些小题大作,最后锁定Nosql领域的`Cassandra`.就像这名字一样,清澈而又明亮.[逼上梁山](http://cassandra.apache.org)...

> [cassandra]({{ site.baseurl }}/assets/images/nosql/cassandra/Cassandra_logo.svg.png):"你也是，疯狂也将找上你。"

![cassandra](http://cassandra.apache.org/media/img/cassandra_logo.png)
 
> The Apache Cassandra database is the right choice when you need scalability and high availability without compromising performance. Linear scalability and proven fault-tolerance on commodity hardware or cloud infrastructure make it the perfect platform for mission-critical data. Cassandra's support for replicating across multiple datacenters is best-in-class, providing lower latency for your users and the peace of mind of knowing that you can survive regional outages.

眼前一亮
--------

> 分布式 线性扩展


	package com.atschx.cassandra.sample;
	
	import java.net.InetAddress;
	import java.util.Date;
	import java.util.UUID;
	
	public class IMProtocolStatisticModel {
	
		private UUID id;
	
		private Integer uid;
		private Long sid;
		private InetAddress ipAddress;
		private Date occuredOn;
	
		private Integer seq;
		private Integer channel;
		private Integer tag;
		private Integer type;
		private String packet;
		private Integer bytes;
	
		private String clientVersion;
		private Integer clientType;

		....//省略setter和getter
	}

[本文案例源码](https://github.com/atschx/cassandra-sample)

## 二、安装及配置

> $cassandra_home/conf/cassandra-env.sh 

	calculate_heap_sizes()
	{
		case "`uname`" in
		    Linux)
		        system_memory_in_mb=`free -m | awk '/:/ {print $2;exit}'`
		        system_cpu_cores=`egrep -c 'processor([[:space:]]+):.*' /proc/cpuinfo`
		    ;;
		    FreeBSD)
		        system_memory_in_bytes=`sysctl hw.physmem | awk '{print $2}'`
		        system_memory_in_mb=`expr $system_memory_in_bytes / 1024 / 1024`
		        system_cpu_cores=`sysctl hw.ncpu | awk '{print $2}'`
		    ;;
		    SunOS)
		        system_memory_in_mb=`prtconf | awk '/Memory size:/ {print $3}'`
		        system_cpu_cores=`psrinfo | wc -l`
		    ;;
		    Darwin)
		        system_memory_in_bytes=`sysctl hw.memsize | awk '{print $2}'`
		        system_memory_in_mb=`expr $system_memory_in_bytes / 1024 / 1024`
		        system_cpu_cores=`sysctl hw.ncpu | awk '{print $2}'`
		    ;;
		    *)
		        # assume reasonable defaults for e.g. a modern desktop or
		        # cheap server
		        system_memory_in_mb="2048"
		        system_cpu_cores="2"
		    ;;
		esac

		# some systems like the raspberry pi don't report cores, use at least 1
		if [ "$system_cpu_cores" -lt "1" ]
		then
		    system_cpu_cores="1"
		fi
		
		# set max heap size based on the following
		# max(min(1/2 ram, 1024MB), min(1/4 ram, 8GB))
		# calculate 1/2 ram and cap to 1024MB
		# calculate 1/4 ram and cap to 8192MB
		# pick the max
		half_system_memory_in_mb=`expr $system_memory_in_mb / 2`
		quarter_system_memory_in_mb=`expr $half_system_memory_in_mb / 2`
		if [ "$half_system_memory_in_mb" -gt "1024" ]
		then
		    half_system_memory_in_mb="1024"
		fi
		if [ "$quarter_system_memory_in_mb" -gt "8192" ]
		then
		    quarter_system_memory_in_mb="8192"
		fi
		if [ "$half_system_memory_in_mb" -gt "$quarter_system_memory_in_mb" ]
		then
		    max_heap_size_in_mb="$half_system_memory_in_mb"
		else
		    max_heap_size_in_mb="$quarter_system_memory_in_mb"
		fi
		MAX_HEAP_SIZE="${max_heap_size_in_mb}M"

		# Young gen: min(max_sensible_per_modern_cpu_core * num_cores, 1/4 * heap size)
		max_sensible_yg_per_core_in_mb="100"
		max_sensible_yg_in_mb=`expr $max_sensible_yg_per_core_in_mb "*" $system_cpu_cores`

		desired_yg_in_mb=`expr $max_heap_size_in_mb / 4`

		if [ "$desired_yg_in_mb" -gt "$max_sensible_yg_in_mb" ]
		then
		    HEAP_NEWSIZE="${max_sensible_yg_in_mb}M"
		else
		    HEAP_NEWSIZE="${desired_yg_in_mb}M"
		fi
	}

## 三、面向查询建模

>  Cassandra data modeling focuses on the queries. 

Cassandra's data model is a partitioned row store with tunable consistency. Rows are organized into tables; the first component of a table's primary key is the partition key; within a partition, rows are clustered by the remaining columns of the key. Other columns can be indexed separately from the primary key. Because Cassandra is a distributed database, efficiency is gained for reads and writes when data is grouped together on nodes by partition. The fewer partitions that must be queried to get an answer to a question, the faster the response.

**按报文字节大小查询**

>说明: 主键部分基于日期进行分区存储,按字节大小降序 

<pre>
CREATE TABLE statistic.protocols_order_by_bytes (
	occured_on text,
	bytes int,
	channel int,
	client_type int,
	client_version text,
	ip_address text,
	occured_at timestamp,
	seq int,
	sid bigint,
	tag int,
	type int,
	uid int,
	PRIMARY KEY (occured_on, bytes)
) WITH CLUSTERING ORDER BY (bytes DESC)
</pre>

## 四、案例分享

>  没有最好,只有最适合. 

* 按报文大小排序->用户何时(When)在哪台(Where)机器接入哪个业务(What)?

<pre>
cqlsh:statistic> select 
             ... bytes,uid,occured_at,ip_address,sid,channel,tag,type  
             ... from 
             ... protocols_order_by_bytes 
             ... where 
             ... occured_on='2015-07-06' and bytes > 10000 
             ... limit 30;
</pre>


<pre>
[user@host cassandra]$ bin/nodetool cfstats statistic.protocols_order_by_bytes
Keyspace: statistic
	Read Count: 12
	Read Latency: 1.9284166666666667 ms.
	Write Count: 8200000
	Write Latency: 0.018335492796608698 ms.
	Pending Flushes: 0
		Table: protocols_order_by_bytes
		SSTable count: 3
		Space used (live): 3271427
		Space used (total): 3271427
		Space used by snapshots (total): 0
		Off heap memory used (total): 1346
		SSTable Compression Ratio: 0.3192803109235681
		Number of keys (estimate): 3
		Memtable cell count: 4179439
		Memtable data size: 1699798
		Memtable off heap memory used: 0
		Memtable switch count: 3
		Local read count: 12
		Local read latency: 1.929 ms
		Local write count: 7485539
		Local write latency: 0.019 ms
		Pending flushes: 0
		Bloom filter false positives: 0
		Bloom filter false ratio: 0.00000
		Bloom filter space used: 48
		Bloom filter off heap memory used: 24
		Index summary off heap memory used: 66
		Compression metadata off heap memory used: 1256
		Compacted partition minimum bytes: 943128
		Compacted partition maximum bytes: 3379391
		Compacted partition mean bytes: 2676673
		Average live cells per slice (last five minutes): 30.166666666666668
		Maximum live cells per slice (last five minutes): 51.0
		Average tombstones per slice (last five minutes): 0.0
		Maximum tombstones per slice (last five minutes): 0.0

----------------
</pre>

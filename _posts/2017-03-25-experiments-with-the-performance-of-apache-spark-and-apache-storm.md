---
layout: post
published: true
title: Experiments with the performance of Apache Spark and Apache Storm
description: Experiments with the performance of Apache Spark and Apache Storm
keywords: >-
  Apache Spark, Custom Partitioning, Co-Partitioning, RDDs, persistence, dag,
  caching, partitioning, hashpartitioner, optimize, performance, speed, memory
---
## Summary

In this post I list my experiments with Apache Spark, Structured Streaming and Apache Storm to understand how in-memory data analytics stacks and stream processing engines work. I worked on this as part of a course ([CS838](http://pages.cs.wisc.edu/~akella/CS838/F16)) I took at UW-Madison.

## Environment

A 5 node cluster, each node with 20GB RAM and 4 cores was used to run this application.

## PageRank Algorithm 

PageRank is an algorithm that is used by Google Search to rank websites in their search engine results. This algorithm iteratively updates a rank for each document by adding up contributions from documents that link to it. The algorithm can be summarized in the following steps -
* Start each page at a rank of 1.
* On each iteration, have page p contribute rank(p)/mod(neighbors(p)) to its neighbors.
* Set each page's rank to 0.15 + 0.85 X contributions.

## Dataset

[Berkeley-Stanford web graph](https://snap.stanford.edu/data/web-BerkStan.html) was used in this project and the algorithm was executed for a total of 10 iterations. Each line in the dataset consists of a URL and one of it's neighbors. This file has to be copied to HDFS.

## Code

The python implementation of the PageRank algorithm in Spark along with the shell scripts to run it can be found here : [Github](https://github.com/ashishvshenoy/pagerank-spark)

## Performance without any custom partitioning

As a benchmark, I wrote a Spark application in python for computing PageRank on the given Berkeley-Stanford web graph without any custom partitioning.
To ensure that the cluster is being fully utilized the spark.executor.instances value in
the SparkSession object was set to 4. I arrived at this value after considering the environment being used. There were 5 nodes with 4 cores each and the number of cores per executor was set as 4. Considering one entire node for the driver, the number of executors instances was set as 5-1=4 to ensure that the rest of the nodes were utilized correctly and avoid over or under utlization.

|<strong>Metric</strong>| <strong>Trial 1</strong>| <strong>Trial 2</strong>| <strong>Trial 3</strong>|
|Completion Time in min| 5.1| 5.0| 5.2|
|Disk Reads in MB| 995| 990| 997|
|DiskWrite in MB| 1808| 1808| 1876|
|N/W Reads in MB| 5089| 5060| 5090|
|N/W Writes in MB| 1814| 1810 |1810|
|Number of Tasks| 572| 572| 572|

## Performance with custom partitioning

In order to optimize the execution and implement custom partitioning I followed following
steps.
### Increased the parallelism
To increase the parallelism in the executors, the following config was added
```
spark.default.parallelism = 16
```
This value was arrived at after considering the fact that we had 4 executors with 4 cores each. Since we assign one cpu per task, ideally we should run 4 tasks per executor. This brings the count to 4*4=16.

### Co-partitioned links and ranks RDD  

* In order to make the dependencies narrow in the join operation of links and ranks, I partitioned both the RDDs with the same partitioning scheme. 
* By default pyspark uses HashPartitioner to partition on keys of a RDD. Since both links and ranks RDD had the same numeric keys, by using _partitionBy(numPartitions)_ I was able to co-partition the RDDs. You can verify the co-partitioning by persisting the RDDs using _saveAsTextFile_ and checking if the number of partitions are equal.
* I found that the number of tasks spawned to read files from HDFS depends on the number of blocks and their locality. This number of tasks in turn determines its initial partition. To efficiently parallelize the I/O from HDFS while reading, I specified the partitions to be 16 and observed a noticeable improvement in performance. I read the dataset from the HDFS using the following syntax.  

```
lines = spark.sparkContext.textFile(sys.argv[1],partitions)
```

'partitions' was set to 16.
* I also realized that some of the operations do not preserve parent partitioning scheme (Eg: map). Hence its important to use _mapValues_ while creating ranks RDD from links in order to preserve the same partitioning scheme for both.
* Also, the _flatMap_ operation used on the RDD obtained after joining links and ranks, loses the partitioning information of its parent. In order to mitigate that I used _partitionBy(numPartitions)_ on ranks after every iteration. Since ranks is a much smaller RDD compared to links, the time and resources spent on doing this in every iteration is negligible.  

The table below shows us the performance metrics of the PageRank application with custom
partitioning.

|<strong>Metric</strong>| <strong>Trial 1</strong>| <strong>Trial 2</strong>| <strong>Trial 3</strong>|
|Completion Time in min| 1.9| 1.8| 1.8|
|Disk Reads in MB| 871| 868| 870|
|Disk Write in MB| 692| 687| 690|
|N/W Reads in MB| 1554| 1554| 1550|
|N/W Writes in MB| 2676| 2676| 2670|
|Number of Tasks| 208| 208| 208|

As is evident from the data above, custom partitioning definitely improved the performance of the application. The completion time fell by 60%, the disk read and writes reduced considerably and the combined network read/write data which is usually an indicator of data moved around in shuffles, also reduced when compared to the application without custom partitioning.

## Performance with persistence

The following table lists the metrics I observed by caching links and ranks RDD with _numPartitions_
set to 16. 
I cached the links RDD when it gets first created. ranks RDD is cached for every iteration. Since ranks RDD is a small dataset, I felt caching it in every iteration is worth the performance overhead. This was corroborated by the data obtained.

|<strong>Metric</strong>| <strong>Trial 1</strong>| <strong>Trial 2</strong>| <strong>Trial 3</strong>|
|Completion Time in min| 1.2| 1.2| 1.1|
|Disk Reads in MB| 865| 864| 866|
|Disk Write in MB| 33| 32| 38|
|N/W Reads in MB| 19.4| 19.5| 19.3|
|N/W Writes in MB| 647| 648| 650|
|Number of Tasks| 208| 208| 208|

As indicated by the above data, we can see that caching the RDDs does improve the performance of the application. I noticed a considerable drop in the amount of data read and written during shuffles. This is indicated by the N/W Read andWrite data in the above table. Since Spark is lazy and does computation and transformation of all the RDDs only when an action is encountered, persisting certain RDDs in iterative applications such as PageRank is beneficial since recomputations can be avoided.  

_PS : I increased the per executor memory to 2g since my application was crashing with
lesser memory._

## Stage Level DAGs for the above applications

Below was the stage level DAG for PageRank without custom partitioning :

![Stage Level DAG for PageRank Without Custom Partitioning Spark UI]({{site.baseurl}}/img/Screen Shot 2017-03-25 at 11.52.04 AM.png)

Below was the stage level DAG for PageRank with custom partitioning. We can see that between every iteration one stage (the partitionBy and mapPartitions) is eliminated because of co-partitioning:

![Stage Level DAG for PageRank With Custom Partitioning Spark UI]({{site.baseurl}}/img/Screen%20Shot%202017-03-25%20at%2011.54.02%20AM.png)

Below was the stage level DAG for PageRank with custom partitioning and persistence. The green dots indicate the cached RDDs being used :

![Stage Level DAG for PageRank With Custom Partitioning and Persistence Spark UI]({{site.baseurl}}/img/Screen Shot 2017-03-25 at 11.56.17 AM.png)


If you found this work useful please cite as:
```
@misc{AshishShenoy_Spark_Storm_Perf,
  author        = {Shenoy, Ashish},
  title         = {Experiments with the performance of Apache Spark and Apache Storm},
  howpublished  = {\url{https://www.ashishvs.in}},
  year          = {2017},
  note          = {Accessed: 2017-03-25},
  url           = {www.ashishvs.in}
} 
```

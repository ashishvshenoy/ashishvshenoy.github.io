---
layout: post
published: true
title: Experiments with the performance of Apache Spark and Apache Storm
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

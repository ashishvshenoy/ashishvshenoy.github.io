---
layout: post
published: true
title: How I Built a Convolutional Neural Network in Java
---
This is a blog post going through the steps I followed to build a CNN using Java to classify and recognize 6 types of images : Airplanes, Flowers, Butterflies, Grand Piano, Starfish and Watches. Disclaimer : This is not the most optimal way to code or build a CNN. This was something I coded within a week in order to learn how CNNs work and understand how backpropogation, early stopping, [dropout](https://www.cs.toronto.edu/~hinton/absps/JMLRdropout.pdf) and [ADAM](https://arxiv.org/pdf/1412.6980.pdf) work in a deep neural network. So please bear with me and forgive my generous use of for loops and tightly coupled code.  
The best test set accuracy achieved using this was 81.46% with 33 test errors in a test set of 178 images.

## Architecture and Config
The following image depicts the CNN structure that I built and will be explaining in the following sections.  
![CNN.png]({{site.baseurl}}/img/CNN.png)

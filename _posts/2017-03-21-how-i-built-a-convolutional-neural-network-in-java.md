---
layout: post
published: true
title: How I Built a Convolutional Neural Network in Java
---
**_<mark>Work in progress. I hope to finish this blog post by end of March.</mark>_**

This is a blog post going through the steps I followed to build a CNN using Java to classify and recognize 6 types of images : Airplanes, Flowers, Butterflies, Grand Piano, Starfish and Watches. Disclaimer : This is not the most optimal way to code or build a CNN. This was something I coded within a week in order to learn how CNNs work and understand how backpropogation, early stopping, [dropout](https://www.cs.toronto.edu/~hinton/absps/JMLRdropout.pdf), [ADAM](https://arxiv.org/pdf/1412.6980.pdf) and [Xavier's](http://deepdish.io/2015/02/24/network-initialization/) method work in a deep neural network. So please bear with me and forgive my generous use of for loops and tightly coupled code. Also, I have refrained from trying to give a detailed explanation of my code, mainly due to lack of time. But I hope this can serve as a starting point for people who want to implement a CNN and learn through the process.
The best test set accuracy achieved using this was 81.46% with 33 test errors in a test set of 178 images.

## Architecture and Config
The following image depicts the CNN structure that I built.  

![CNN.png]({{site.baseurl}}/img/CNN.png)  

The configuration of the network is as follows :  

| Input | 4 x 32 x 32 |
| Leaky ReLU coefficient | 0.01 |
| Conv1 + Leaky ReLU Kernel | 8 x 4 x 5 x 5, Stride : 1, Padding: 0 |
| Maxpool1 Kernel | 8 x 2 x 2, Stride : 2 |
| Conv2 + Leaky ReLU Kernel | 16 x 8 x 5 x 5, Stride : 1, Padding: 0 |
| Maxpool2 Kernel | 16 x 2 x 2, Stride : 2 |
| Fully Connected Leaky ReLU Hidden Units | 1000 |
| Outputs | 6 Sigmoids |

## Forward Pass - Convolutional Layers
The logic for the forward pass is pretty straightforward. It's easy to visualize a smaller matrix sliding over a bigger matrix. The details about exactly how the forward pass works is very clearly explained by Andrej Karpathy here : [Stanford CS231n](http://cs231n.github.io/convolutional-networks/)
The Java code that I wrote looks something like this : 

```java
public void convolutionLayer(double[][][] input, double[][][][] filter, double[] bias, int stride,
			double[][][] output, double[][][] dropOutMask, boolean isTest) {
		for (int dim = 0; dim < filter.length; dim++) {
			for (int filterNo = 0; filterNo < filter[dim].length; filterNo++) {
				for (int row = 0; row < input[filterNo].length; row++) {
					for (int col = 0; col < input[filterNo][0].length; col++) {
						if (col + filter[dim][filterNo].length > input[filterNo][0].length
								|| row + filter[dim][filterNo].length > input[filterNo].length) {
							break;
						}
						double[][] submatrix = submatrix(input[filterNo], row, col, filter[dim][filterNo].length);
						if (dropOut && dropOutMask != null) {
							double[][] submatrixMask = submatrix(dropOutMask[filterNo], row, col,
									filter[dim][filterNo].length);
							if (isTest)
								output[dim][row][col] += dropOutRate
										* convolute(submatrix, submatrixMask, filter[dim][filterNo]);
							else {
								output[dim][row][col] += convolute(submatrix, submatrixMask, filter[dim][filterNo]);
							}
						} else {
							output[dim][row][col] += convolute(submatrix, filter[dim][filterNo]);
						}
					}
				}
			}
		}

		for (int i = 0; i < output.length; i++) {
			for (int j = 0; j < output[i].length; j++) {
				for (int k = 0; k < output[i][j].length; k++) {
					if (!dropOut || dropOutMask == null)
						output[i][j][k] = Utilities.leakyRelu(output[i][j][k] + biasInitialValue * bias[i]);
					else
						output[i][j][k] = Utilities.leakyRelu(output[i][j][k] + biasInitialValue * bias[i]);
				}
			}
		}
	}
 ```
 
 
## Forward Pass - Maxpool Layers
 Just like the convolutional layer, except that instead of applying a convolution function, you would just select the maximum value in a sliding window.
 
```java
public void poolingLayer(double[][][] input, int poolSize, int stride, double[][][] output) {
		for (int inputPlate = 0; inputPlate < input.length; inputPlate++) {
			int outputRow = 0;
			int outputCol = 0;
			for (int row = 0; row < input[inputPlate].length; row += stride) {
				for (int col = 0; col < input[inputPlate][0].length; col += stride) {
					if (col + poolSize > input[inputPlate][0].length || row + poolSize > input[inputPlate].length) {
						break;
					}
					double[][] submatrix = submatrix(input[inputPlate], row, col, poolSize);
					output[inputPlate][outputRow][outputCol] = maxPool(submatrix);
					outputCol++;
				}
				outputRow++;
				outputCol = 0;
			}
		}
	}
```


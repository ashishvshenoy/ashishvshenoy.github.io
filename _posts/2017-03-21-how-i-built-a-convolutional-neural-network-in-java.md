---
layout: post
published: true
title: How I Built a Convolutional Neural Network in Java
---


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

## Backprop
The backprop is probably the trickiest to write from scratch for convolution layers. Remember that there is a maxpool following every convolution layer, thus the weight updates too would have to be masked such that only the connections that contributed after the maxpool get updated.
Following is my very inefficient implementation. Obviously there is a lot of scope for improvement here, but hey! it works really well in the end.

```java
public void backprop(double[] outputLabels) {
		double[] deltas_output = new double[finalOutput.length];
		for (int j = 0; j < finalOutput.length; j++) {
			deltas_output[j] = finalOutput[j] * (1 - finalOutput[j]) * (finalOutput[j] - outputLabels[j]);
			if (t % 100 == 0) {
				// System.out.println(outputLabels[j] + ":" + finalOutput[j] +
				// ":" + deltas_output[j] + ",");
			}
		}

		// full connected layer before output

		double[] deltas_hidden_unit_output = new double[filter4];

		for (int i = 0; i < filter4; i++) {
			double sum = 0;
			if (dropOut) {
				if (outputHiddenLayerDropOutMask[i] == 0) {
					deltas_hidden_unit_output[i] = 0;
				}
			} else {
				for (int j = 0; j < outputLayerSize; j++) {
					sum += outputLayer[j][i] * deltas_output[j];
				}
				deltas_hidden_unit_output[i] = sum;
			}
			if (outputHiddenLayer[i] <= 0) {
				deltas_hidden_unit_output[i] *= Utilities.leakyReLU_a;
			}
		}

		// pool2 to one layer hidden unit
		double[][][] deltas_conv_to_hidden_unit = new double[convLayer2Plate][outputPoolLayer2Size][outputPoolLayer2Size];

		for (int dim = 0; dim < outputPoolLayer2.length; dim++) {
			for (int row = 0; row < outputPoolLayer2Size; row++) {
				for (int col = 0; col < outputPoolLayer2Size; col++) {
					double sum = 0;
					int positionIn1DVector = (int) (dim * outputPoolLayer2Size + row * outputPoolLayer2Size + col);

					for (int j = 0; j < filter4; j++) {
						sum += hiddenUnitsLayer[j][positionIn1DVector] * deltas_hidden_unit_output[j];
					}

					if (dropOut) {
						if (outputPoolLayer2DropOutMask[positionIn1DVector] == 0) {
							sum = 0;
						}
					}
					if (outputPoolLayer2[dim][row][col] <= 0) {
						deltas_conv_to_hidden_unit[dim][row][col] += sum * Utilities.leakyReLU_a;
					} else {
						deltas_conv_to_hidden_unit[dim][row][col] += sum;
					}
				}
			}
		}

		deltas_conv_to_hidden_unit = Utilities.upsample(deltas_conv_to_hidden_unit, outputConvLayer2, poolFilter2,
				poolStride2, true);

		// 1st conv to 2nd conv layer
		double[][][] deltas_conv_to_conv_unit = new double[outputPoolLayer1.length][outputPoolLayer1Size][outputPoolLayer1Size];

		for (int dim = 0; dim < outputPoolLayer1.length; dim++) {
			for (int row = 0; row < outputPoolLayer1[0].length; row++) {
				for (int col = 0; col < outputPoolLayer1[0][0].length; col++) {
					if ((row + filter2) > outputPoolLayer1[0].length
							|| (col + filter2) > outputPoolLayer1[0][0].length) {
						break;
					}
					double[][] submatrix = submatrix(outputPoolLayer1[dim], row, col, filter2);
					for (int i = 0; i < submatrix.length; i++) {
						for (int j = 0; j < submatrix[0].length; j++) {
							for (int plate = 0; plate < convLayer2.length; plate++) {
								if (dropOut && outputPoolLayer1DropOutMask[dim][row + i][col + j] == 0)
									deltas_conv_to_conv_unit[dim][row + i][col + j] = 0;
								else {
									if (outputPoolLayer1[dim][row + i][col + j] <= 0) {
										deltas_conv_to_conv_unit[dim][row + i][col + j] += Utilities.leakyReLU_a
												* convLayer2[plate][dim][i][j]
												* deltas_conv_to_hidden_unit[plate][row][col];
									} else {
										deltas_conv_to_conv_unit[dim][row + i][col + j] += convLayer2[plate][dim][i][j]
												* deltas_conv_to_hidden_unit[plate][row][col];
									}
								}
							}
						}
					}
				}
			}
		}

		deltas_conv_to_conv_unit = Utilities.upsample(deltas_conv_to_conv_unit, outputConvLayer1, poolFilter1,
				poolStride1, true);

		// ********UPDATE ALL WEIGHTS*********/

		double[][][][] convLayer1_m_temp = new double[convLayer1_m.length][convLayer1_m[0].length][convLayer1_m[0][0].length][convLayer1_m[0][0][0].length];
		double[][][][] convLayer1_t_temp = new double[convLayer1_m.length][convLayer1_m[0].length][convLayer1_m[0][0].length][convLayer1_m[0][0][0].length];
		for (int dim = 0; dim < input.length; dim++) {
			for (int row = 0; row < input[0].length; row++) {
				for (int col = 0; col < input[0][0].length; col++) {
					if ((row + filter1 > input[0].length) || (col + filter1 > input[0][0].length)) {
						break;
					}
					double[][] submatrix = submatrix(input[dim], row, col, filter1);
					for (int i = 0; i < submatrix.length; i++) {
						for (int j = 0; j < submatrix.length; j++) {
							for (int plate = 0; plate < convLayer1.length; plate++) {
								if (adam) {
									double gradient = submatrix[i][j] * deltas_conv_to_conv_unit[plate][row][col];
									double m_t = beta_1 * convLayer1_m[plate][dim][i][j] + (1 - beta_1) * gradient;
									double v_t = beta_2 * convLayer1_t[plate][dim][i][j]
											+ (1 - beta_2) * Math.pow(gradient, 2);
									convLayer1[plate][dim][i][j] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
									convLayer1_m_temp[plate][dim][i][j] += m_t;
									convLayer1_t_temp[plate][dim][i][j] += v_t;
								} else {
									double gradient = submatrix[i][j] * deltas_conv_to_conv_unit[plate][row][col];
									convLayer1[plate][dim][i][j] -= learningRate * gradient;
								}
							}
						}
					}
				}
			}
		}
		convLayer1_m = convLayer1_m_temp;
		convLayer1_t = convLayer1_t_temp;

		double[] convLayer1Bias_m_temp = new double[convLayer1Bias_m.length];
		double[] convLayer1Bias_t_temp = new double[convLayer1Bias_t.length];
		for (int i = 0; i < convLayer1.length; i++) {
			for (int j = 0; j < convLayer1[0].length; j++) {
				for (int k = 0; k < convLayer1[0].length; k++) {
					if (adam) {
						double gradient = biasInitialValue * deltas_conv_to_conv_unit[i][j][k];
						double m_t = beta_1 * convLayer1Bias_m[i] + (1 - beta_1) * gradient;
						double v_t = beta_2 * convLayer1Bias_t[i] + (1 - beta_2) * Math.pow(gradient, 2);
						convLayer1Bias[i] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
						convLayer1Bias_m_temp[i] += m_t;
						convLayer1Bias_t_temp[i] += v_t;
					} else {
						double gradient = biasInitialValue * deltas_conv_to_conv_unit[i][j][k];
						if (gradient > maxGradient) {
							maxGradient = gradient;
						} else if (gradient < minGradient) {
							minGradient = gradient;
						}
						convLayer1Bias[i] -= gradient * learningRate;
					}
				}
			}
		}
		convLayer1Bias_m = convLayer1Bias_m_temp;
		convLayer1Bias_t = convLayer1Bias_t_temp;

		double[][][][] convLayer2_m_temp = new double[convLayer2_m.length][convLayer2_m[0].length][convLayer2_m[0][0].length][convLayer2_m[0][0][0].length];
		double[][][][] convLayer2_t_temp = new double[convLayer2_m.length][convLayer2_m[0].length][convLayer2_m[0][0].length][convLayer2_m[0][0][0].length];
		for (int dim = 0; dim < outputPoolLayer1.length; dim++) {
			for (int row = 0; row < outputPoolLayer1[0].length; row++) {
				for (int col = 0; col < outputPoolLayer1[0][0].length; col++) {
					if ((row + filter2 > outputPoolLayer1[0].length)
							|| (col + filter2 > outputPoolLayer1[0][0].length)) {
						break;
					}
					double[][] submatrix = submatrix(outputPoolLayer1[dim], row, col, filter2);
					double[][] submatrixMask = null;
					if (dropOut) {
						submatrixMask = submatrix(outputPoolLayer1DropOutMask[dim], row, col, filter2);
					}
					for (int i = 0; i < submatrix.length; i++) {
						for (int j = 0; j < submatrix.length; j++) {
							for (int plate = 0; plate < convLayer2.length; plate++) {
								double gradient = 0;
								if (dropOut) {
									gradient = submatrix[i][j] * submatrixMask[i][j]
											* deltas_conv_to_hidden_unit[plate][row][col];
								} else {
									gradient = submatrix[i][j] * deltas_conv_to_hidden_unit[plate][row][col];
								}
								if (adam) {
									double m_t = beta_1 * convLayer2_m[plate][dim][i][j] + (1 - beta_1) * gradient;
									double v_t = beta_2 * convLayer2_t[plate][dim][i][j]
											+ (1 - beta_2) * Math.pow(gradient, 2);
									convLayer2[plate][dim][i][j] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
									convLayer2_m_temp[plate][dim][i][j] += m_t;
									convLayer2_t_temp[plate][dim][i][j] += v_t;
								} else {
									if (gradient > maxGradient) {
										maxGradient = gradient;
									} else if (gradient < minGradient) {
										minGradient = gradient;
									}
									convLayer2[plate][dim][i][j] -= learningRate * gradient;
								}
							}
						}
					}
				}
			}
		}
		convLayer2_m = convLayer2_m_temp;
		convLayer2_t = convLayer2_t_temp;

		double[] convLayer2Bias_m_temp = new double[convLayer2Bias_m.length];
		double[] convLayer2Bias_t_temp = new double[convLayer2Bias_t.length];
		for (int i = 0; i < convLayer2.length; i++) {
			for (int j = 0; j < outputConvLayer2[0].length; j++) {
				for (int k = 0; k < outputConvLayer2[0].length; k++) {
					if (adam) {
						double gradient = biasInitialValue * deltas_conv_to_hidden_unit[i][j][k];
						double m_t = beta_1 * convLayer2Bias_m[i] + (1 - beta_1) * gradient;
						double v_t = beta_2 * convLayer2Bias_t[i] + (1 - beta_2) * Math.pow(gradient, 2);
						convLayer2Bias[i] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
						convLayer2Bias_m_temp[i] += m_t;
						convLayer2Bias_t_temp[i] += v_t;
					} else {
						double gradient = biasInitialValue * deltas_conv_to_hidden_unit[i][j][k];
						if (gradient > maxGradient) {
							maxGradient = gradient;
						} else if (gradient < minGradient) {
							minGradient = gradient;
						}
						convLayer2Bias[i] -= gradient * learningRate;
					}
				}
			}

		}
		convLayer2Bias_m = convLayer1Bias_m_temp;
		convLayer2Bias_t = convLayer1Bias_t_temp;

		int count = 0;
		double[][] hiddenUnitsLayer_m_temp = new double[hiddenUnitsLayer_m.length][hiddenUnitsLayer_m[0].length];
		double[][] hiddenUnitsLayer_t_temp = new double[hiddenUnitsLayer_m.length][hiddenUnitsLayer_m[0].length];

		for (int dim = 0; dim < outputPoolLayer2.length; dim++) {
			for (int row = 0; row < outputPoolLayer2[0].length; row++) {
				for (int col = 0; col < outputPoolLayer2[0][0].length; col++) {
					for (int i = 0; i < filter4; i++) {
						double gradient = 0;
						if (dropOut) {
							gradient = outputPoolLayer2DropOutMask[count] * outputPoolLayer2[dim][row][col]
									* deltas_hidden_unit_output[i];
						} else {
							gradient = outputPoolLayer2[dim][row][col] * deltas_hidden_unit_output[i];
						}
						if (adam) {
							double m_t = beta_1 * hiddenUnitsLayer_m[i][count] + (1 - beta_1) * gradient;
							double v_t = beta_2 * hiddenUnitsLayer_t[i][count] + (1 - beta_2) * Math.pow(gradient, 2);
							hiddenUnitsLayer[i][count] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
							hiddenUnitsLayer_m_temp[i][count] += m_t;
							hiddenUnitsLayer_t_temp[i][count] += v_t;
						} else {
							if (gradient > maxGradient) {
								maxGradient = gradient;
							} else if (gradient < minGradient) {
								minGradient = gradient;
							}
							hiddenUnitsLayer[i][count] -= learningRate * gradient;
						}
					}
					count++;
				}
			}
		}
		hiddenUnitsLayer_m = hiddenUnitsLayer_m_temp;
		hiddenUnitsLayer_t = hiddenUnitsLayer_t_temp;

		double[] hiddenUnitsLayerBias_m_temp = new double[hiddenUnitsLayerBias_m.length];
		double[] hiddenUnitsLayerBias_t_temp = new double[hiddenUnitsLayerBias_m.length];
		for (int i = 0; i < hiddenUnitsLayerBias.length; i++) {
			if (adam) {
				double gradient = biasInitialValue * deltas_hidden_unit_output[i];
				double m_t = beta_1 * hiddenUnitsLayerBias_m[i] + (1 - beta_1) * gradient;
				double v_t = beta_2 * hiddenUnitsLayerBias_t[i] + (1 - beta_2) * Math.pow(gradient, 2);
				hiddenUnitsLayerBias[i] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
				hiddenUnitsLayerBias_m_temp[i] += m_t;
				hiddenUnitsLayerBias_t_temp[i] += v_t;
			} else {
				double gradient = biasInitialValue * deltas_hidden_unit_output[i];
				if (gradient > maxGradient) {
					maxGradient = gradient;
				} else if (gradient < minGradient) {
					minGradient = gradient;
				}
				hiddenUnitsLayerBias[i] -= gradient * learningRate;
			}

		}

		hiddenUnitsLayerBias_m = hiddenUnitsLayerBias_m_temp;
		hiddenUnitsLayerBias_t = hiddenUnitsLayerBias_t_temp;

		double[][] outputLayer_m_temp = new double[outputLayer_m.length][outputLayer_m[0].length];
		double[][] outputLayer_t_temp = new double[outputLayer_m.length][outputLayer_m[0].length];

		for (int i = 0; i < outputHiddenLayer.length; i++) {
			for (int j = 0; j < finalOutput.length; j++) {
				double gradient = outputHiddenLayer[i] * deltas_output[j];
				if (gradient > maxGradient) {
					maxGradient = gradient;
				} else if (gradient < minGradient) {
					minGradient = gradient;
				}
				if (adam) {
					double m_t = beta_1 * outputLayer_m[j][i] + (1 - beta_1) * gradient;
					double v_t = beta_2 * outputLayer_t[j][i] + (1 - beta_2) * Math.pow(gradient, 2);
					outputLayer[j][i] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
					outputLayer_m_temp[j][i] += m_t;
					outputLayer_t_temp[j][i] += v_t;
				} else {
					outputLayer[j][i] -= learningRate * gradient;
				}
			}
		}
		outputLayer_m = outputLayer_m_temp;
		outputLayer_t = outputLayer_t_temp;

		double[] outputHiddenLayerBias_m_temp = new double[outputHiddenLayerBias_m.length];
		double[] outputHiddenLayerBias_t_temp = new double[outputHiddenLayerBias_m.length];

		for (int i = 0; i < outputLayer.length; i++) {
			if (adam) {
				double gradient = biasInitialValue * deltas_output[i];
				double m_t = beta_1 * outputHiddenLayerBias_m[i] + (1 - beta_1) * gradient;
				double v_t = beta_2 * outputHiddenLayerBias_t[i] + (1 - beta_2) * Math.pow(gradient, 2);
				outputHiddenLayerBias[i] -= (learningRate * m_t) / (Math.sqrt(v_t) + epsilon);
				outputHiddenLayerBias_m_temp[i] += m_t;
				outputHiddenLayerBias_t_temp[i] += v_t;
			} else {
				double gradient = biasInitialValue * deltas_output[i];
				if (gradient < minGradient) {
					minGradient = gradient;
				}
				if (gradient > maxGradient) {
					maxGradient = gradient;
				}
				outputHiddenLayerBias[i] -= learningRate * gradient;
			}
		}
		outputHiddenLayerBias_m = outputHiddenLayerBias_m_temp;
		outputHiddenLayerBias_t = outputHiddenLayerBias_t_temp;
	}
```

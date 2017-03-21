---
layout: post
published: true
title: Recommender Systems and Collaborative Filtering - Walkthrough
---
Summary
=======

Every user on the internet today is faced with an overwhelming set of
choices on almost every website he/she visits. Be it Facebook, Spotify,
Amazon or Google, there is a need to filter, rank and deliver relevant
information quickly in order to alleviate the problem of information
overload. Recommender systems are used in almost every major website
these days to solve this problem by searching through a large volume of
dynamically generated information to provide users with personalized
content and services. See Figure 1 [1]((https://www.ischool.utexas.edu/~i385q/readings/Balabanovic_Shoham-1997-Fab.pdf)).  

![RecommenderSystem.png]({{site.baseurl}}/img/RecommenderSystem.png)


After completing this walkthrough you should be able to :

-   Understand what Recommender Systems do.

-   Get a high level overview of different approaches used in
    Recommender Systems.

-   Understand the concept of collaborative filtering.

-   Learn how to implement collaborative filtering using low dimensional
    matrix factorization method.

-   Get a hands on experience on building a collaborative filtering
    recommender system for a real-life dataset.
    
Background {#sec:examples}
==========

Recommender systems have become extremely popular in recent years. They
are a subclass of information filtering systems that seek to predict the
“rating” or “preference” that a user would give to an item. Applications
of recommender systems include: movies, music, news, books, research
articles, search queries, social tags, and products. For example,
recommending news articles to on-line newspaper readers.  
**Basic Concepts :**  
**User:** any individual who provides ratings to a system. User who
provides provides ratings ratings and user who receive receive
recommendations recommendations.  
**Item:** anything for which a human can provide a rating. Eg. art,
books, CDs, journal articles, music, movie, or vacation destinations  
**Ratings:** vote from a user for an item by means of some value.
Scalar/ordinal ratings (5 points Likert scale), binary ratings
like/dislike), unary rating (observed/abase of rating).
Recommender systems typically produce a list of recommendations in one of two ways – through collaborative and content-based filtering.  
-   **Collaborative filtering**: This approach is used to build a model
    from user’s past behaviour i.e. items previously purchased or
    selected and/or numerical ratings given to those items as well as
    similar decisions made by other users. This model is then used to
    predict items (or ratings for items) that the user may have an
    interest in.

-   **Content-based filtering**: This approach uses features of an item
    in order to recommend additional items with similar
    features/properties.  
    Sometimes the above two approaches are often combined and termed as
    Hybrid Recommender Systems.
    
![coll_filter.jpg]({{site.baseurl}}/img/coll_filter.jpg)

![content_based.jpg]({{site.baseurl}}/img/content_based.jpg)

![spotify_recommendation.png]({{site.baseurl}}/img/spotify_recommendation.png)


The differences between collaborative and content-based filtering can be
demonstrated by comparing two popular music recommender systems –
Last.fm and Pandora Radio.  
Last.fm creates a “station” of recommended songs by observing what bands
and individual tracks the user has listened to on a regular basis and
comparing those against the listening behavior of other users. Last.fm
will play tracks that do not appear in the user’s library, but are often
played by other users with similar interests. As this approach leverages
the behavior of users, it is an example of a collaborative filtering
technique.  
Pandora uses the properties of a song or artist (a subset of the 400
attributes provided by the Music Genome Project) in order to seed a
“station” that plays music with similar properties. User feedback is
used to refine the station’s results, deemphasizing certain attributes
when a user “dislikes” a particular song and emphasizing other
attributes when a user “likes” a song. This is an example of a
content-based approach.  
Each type of system has its own strengths and weaknesses. In the above
example, Last.fm requires a large amount of information on a user in
order to make accurate recommendations. This is an example of the cold
start problem, and is common in collaborative filtering systems. While
Pandora needs very little information to get started, it is far more
limited in scope (for example, it can only make recommendations that are
similar to the original seed).  

Recommender systems are a useful alternative to search algorithms since
they help users discover items they might not have found by themselves.
Interestingly enough, recommender systems are often implemented using
search engines indexing non-traditional data.

In this tutorial we will be exploring an implementation of Collaborative
Filtering using matrix factorization.  

The Problem
-----------

To illustrate an everyday application of Collaborative Filtering, let’s
consider building the “Recommended Movies” section of IMDB. Most of the
recommender systems usually have a set of users and a group of items,
such as videos, movies, books or music. A common insight that these
recommenders follow are that personal tastes are correlated. If Alice
and Bob both like X and Alice likes Y then Bob is more likely to like Y
especially (perhaps) if Bob knows Alice. Thus, given that the users have
rated some items in the system, we would like to predict how the users
would rate the items that they have not yet rated, so that we can make
recommendations to the users.  
Assume each user gives a movie a rating between 1 and 5 stars and we
have 5 users and 7 movies. We can represent this users and video ratings
information as a matrix such as the one in figure .  
Our task now is to predict the ratings for all the entries with ?. We
will use low dimensional matrix factorization method to accomplish this.  

Low Dimensional Matrix Factorization
------------------------------------

To get the intution behind matrix factorization, lets consider the
example in figure. As discussed above personal tastes
are correlated. For example, two users would give high ratings to a
certain movie like the actors/singers of the video or if the genre is
liked by both the users. Hence, if we can find these
characteristics/features/properties of users and movies, we can easily
predict the rating of unknown movies. Also the number of features are
very small as compared to number of users and movies. Now lets see the
math behind matrix factorization. We need to obtain the two matrices:
users(P) and movies(Q)  
We have a $$m \times n$$ matrix of users and items and we need to find two
matrices P($$m \times k$$) and Q($$n  \times k$$) such that their product
approximates R. See Figure \ref{fig:matrixFactorization}. Note:
$$k \ll m,n$$ $$R \approx P \times Q^T = \widehat{R}$$  

**Why not SVD?**  
You must be wondering why we are not using SVD for factorization. The
problem is that SVD is not defined if there are missing values in
matrix. We can tackle this problem by filling missing values with zeros
or the average rating that user has given to rest of the videos. But if
the matrix is too big, millions of users and items then this may not be
a good idea.

Cold Start
----------

A common problem faced by most recommender systems is something called
as a Cold start problem.  
In collaborative filtering, the recommender system tries to infer the
rating an active user would give to an item from the choices like-minded
users would have made. This approach would fail when there are some
items which no user has rated previously. Specifically, it concerns the
issue that the system cannot draw any inferences for users or items
about which it has not yet gathered sufficient information.  

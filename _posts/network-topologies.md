{{{
  "title" : "Rhizome, interactive performances and network topologies",
  "tags" : [ "rhizome", "tutorial", "networks", "tips" ],
  "category": "rhizome",
  "date" : "08-25-2015"
}}}

[Fields](http://funktion.fm/projects/fields-infos) and [New weave](http://funktion.fm/projects/newweave) are two interactive performances which allow audience members to participate by using their mobile phone. They use a tool which I have released about one and a half years ago, and which is called [rhizome](http://github.com/sebpiq/rhizome).

In this post, I will quickly introduce **rhizome**, and explain what kind of network setup, equipment and configuration I use for these live performances.

<!--more-->

About rhizome
===============

[rhizome](http://github.com/sebpiq/rhizome) is a web server which allows to build participative performances by connecting audience's and performers' devices via **OSC and websockets**. It is packaged so that you should be able to install it and set-it up, even if you have no experience in programming. However, more advanced users can also configure everything, or program their own server from scratch by using rhizome base classes and functions (API not documented yet).

rhizome is built with the following aspects in mind, critical for a live performance situation :

- **reliability** : it shouldn't crash, and if it does it should be able to restore all the connections
- **speed** : it should be optimized so that many messages can be sent
- **scalability** : it should support 10 connections or 10000
- **inter-operability** : it should be able to work with Pure Data, Max, Processing ...

Making rhizome easy enough to use for non-programmers, while keeping it neat, flexible, fast, reliable, scalable ... is not an easy task. And though there is still a lot of work, [things to fix and things to implement](https://github.com/sebpiq/rhizome/issues), it is slowly getting there. I am happy to see that a few people have used it successfully [for their own performances](https://github.com/sebpiq/rhizome/wiki/Gallery), and I hope more people will use it in the future, for the more it is used, the better it will become.

Now, one recurrent question I get is, 

**"How do you setup a wireless network and what equipment do you use?"**

And so here are a few pointers ...


Network topology and equipment
===============================

Small performances < 15 connections
------------------------------------------

For very small performances, you don't really need any fancy network equipment :

<img src="https://raw.githubusercontent.com/sebpiq/rhizome/master/images/network-diagram1.png" style="max-width:100%;width:25em;"/>

- **WIFI router** : can be any home WIFI router. Typically, those cost between 15 and 50 euros. personnally I have this cheap [TP-link router](http://www.tp-link.fi/products/details/cat-9_TL-WR841ND.html) which worked alright for performances with 10-12 connections (more than that it starts to choke a bit). I just happened to have this one at home for my own WIFI network, but any cheap home router will do.

- **rhizome server** : is basically a computer that runs rhizome. I usually use my own Ubuntu laptop, which I optimize for the occasion (I'll talk about deployment in a next blog post). You can use any computer as long as you can install **node.js** on it. I have even performed with rhizome running from a Raspberry Pi (quite slow).


The Apple Airport Express option
----------------------------------

This is an option that is worth mentioning. The [Apple Airport Extreme](https://www.apple.com/airport-extreme/) supports up to 50 wireless connections. So if that is enough for your use, you should consider using this (overpriced but quite powerful router) instead of the more complex solution I will detail below.


Middle-sized performances < 250 connections
---------------------------------------------

A home WIFI router is typically a combination of a router, a switch and a WIFI access point, all integrated into a single device. If you expect up to 250 connections, you will need a network that can scale. For this you have to buy and install all router, switch and access points separately.


This is the setup I have been using : 

<img src="https://raw.githubusercontent.com/sebpiq/rhizome/master/images/network-diagram2.png" style="max-width:100%;width:30em;"/>

- **Router** : this is a **wired** router. Its role is to attribute IP addresses to devices on the network and route messages from one device to another. The router is the reason for the 250 limit. On a single network, there is only 255 IP addresses available. Some are reserved, and you will need a couple more for the rhizome server, access points, ... which brings us down to 250, probably less in most cases.

- **Switch** : the role of a switch is to connect several devices to the same network. It is **a bit** like a multi-socket but for ethernet cables ...

- **WIFI access point** : the name is pretty self-explanatory. These devices provide wireless access to phones, tablets, computers ... Check carefully before buying those because they typically support only a small number of connections. Therefore you will most likely need to buy several of them. The access points I use for example support up to 50 people. Therefore to support 250 people, I would need 5 of them. Also, make sure that you have enough space on your switch!!!

Such network equipment is usually quite expensive and can be complicated to configure. Not every router is compatible with every access point. I recommend the brand **Ubiquiti** which has very affordable products and is very easy to set-up. I've used [this router](https://www.ubnt.com/edgemax/edgerouter-lite/) from them, with several of [these access points](https://www.ubnt.com/unifi/unifi-ap/).


250++, I am planning to perform in a stadium!
----------------------------------------------

Rhizome is not ready for that. The bottleneck here is how many concurrent connections the websocket server can handle. Answers to that question vary wildly (from 100 to 1 million!), it depends on your computer, your OS, on how many messages you send, if you send big files, etc, etc ... 

Anyways, in order to scale up, you should be able to run several rhizome servers, and have them communicate with each other in order to share messages and reach all the connections. This is something that is planned, but probably not before version 0.9.0.


Configuring tips
===========================

Ok ... now you have all the gear, how do you configure it? Well ... that completely depends on what brand it is, but here are a few general advices and things to keep in mind.


Accessing the configuration interface of your router (wired or wireless)
--------------------------------------------------------------------------

Most routers can be configured via a web interface. You just need to connect a computer to that router (via cable or wireless), figure out what is the IP of the router (`XXX.YYY.ZZZ.1`, where `XXX`, `YYY` and `ZZZ` are the 3 first numbers of your computer's IP address), open a web browser and go to that router's IP address. The login and password for the configuration interface are usually given in the user guide of the router.


Attributing fixed IP addresses to the rhizome server and access points
----------------------------------------------------------------------------

When a device connects, your router's DHCP server will attribute a free IP address to that device. However, you might want the rhizome server and some other key devices - like your access points - to always get the same IP address from the DHCP server. This can usually be configured via your router's configuration interface. Look for the DHCP section, then look for something like "static IP mapping". 


Limiting the number of connections
-------------------------------------

If for any reason you want to limit the number of people that can connect to your network, you can configure the DHCP server of your router to attribute IP addresses only within a certain range. For example if you want to limit to 30 connections, you can have the DHCP attribute only IPs within `XXX.YYY.ZZZ.100` and `XXX.YYY.ZZZ.130`. If you do this though, make sure that you have a short DHCP lease time. Otherwise if somebody connects and then leaves, its IP address will be blocked.


WIFI network protection
---------------------------

In most cases, it is fine to not have a password on your WIFI network. It is faster for people to connect. However, if you play in a venue will a lot of people passing near-by (for example a festival or a public space), phones from passerbys might automatically connect to your network, taking space for nothing. In that case it might be a good idea to protect the network with a simple password, so that only participants can connect.

[comments](http://twitter.com/sebpiq/status/636197123587969024)

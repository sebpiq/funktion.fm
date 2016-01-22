{{{
  "title" : "Audio glitches with a linux terminal",
  "tags" : ["other"],
  "project": "other",
  "date" : "01-15-2016"
}}}

Here is an old hack with a terminal to listen to the guts of your computer.

`aplay` is a great tool available on most linux distributions which allows you to read raw data, and interpret it as audio. You just give it the data source, tell it how to interpret it (sample rate, sample format, number of channels) and it will play it back.

**note1** : being able to pipe raw data to your sound card is the key here ... I use Ubuntu, so it is very easy to do with the command `aplay`. On the other hand on OSX I have no idea how you could do that. If someone knows, please get in touch!

**note2** : be careful with the volume of your speakers or headphones. All these audio examples are quite loud. 

This is how it sounds when you give `aplay` an mp3 file :

<img src="/audio/terminal-procrastination/wf1.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/1.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/1.mp3" type="audio/mp3">
</audio>
```bash
cat ~/Music/Cameosis/03-Cameo-PleaseYou.mp3 | aplay -r 8000 -c2
```


`-r 8000` means that we interpret the sound with sample rate of *8000hz*, `-c2` means stereo.

Not very exciting ... mostly white noise. This is because the raw data in a mp3 file is not periodical. There is however a lot of files in your computer that have a repetitive structure, and can make very interesting sounds. For example :

<img src="/audio/terminal-procrastination/wf2.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/2.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/2.mp3" type="audio/mp3">
</audio>
```bash
sudo cat /var/log/mongodb/mongodb.log | aplay -c2 -f MU_LAW
```

<img src="/audio/terminal-procrastination/wf3.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/3.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/3.mp3" type="audio/mp3">
</audio>
```bash
sudo cat /var/log/mongodb/mongodb.log | aplay -c2 -r 4000 -f MU_LAW
```

<img src="/audio/terminal-procrastination/wf4.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/4.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/4.mp3" type="audio/mp3">
</audio>
```bash
sudo cat /var/lib/mongodb/overwhelmed.0 | aplay -c2 -f MU_LAW
```

`-f MU_LAW` here specifies the format of the sound. There is several different formats you can use, and choosing a different format will have a big impact on the sound. Available formats are listed in `aplay` documentation (which you can read by typing `man aplay`).

Above I used a database as input, and log files. These all have a periodical structure, and you can hear it reflected in the sounds generated.

You can also use live data as input to `aplay`. For example devices from your system :

<img src="/audio/terminal-procrastination/wf5.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/5.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/5.mp3" type="audio/mp3">
</audio>
```
sudo cat /dev/vga_arbiter | aplay -r 2000 -c2 -f MU_LAW
```

The result here is quite boring as the data is not changing. However we can get more interesting sounds with data from `tcpdump` - which captures the traffic from your network connection :

<img src="/audio/terminal-procrastination/wf6.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/6.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/6.mp3" type="audio/mp3">
</audio>
```
sudo tcpdump -vvv -i wlan0 | aplay -c2 -r 2000 -f FLOAT_LE
```

And finally - one that I quite like - you can listen to your webcam by using a software called `ffmpeg` to capture input from the cam and piping it to `aplay` as we did before. The sonic results are surprising deep and complex, though the sound doesn't really change :

<img src="/audio/terminal-procrastination/wf7.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/7.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/7.mp3" type="audio/mp3">
</audio>
```
ffmpeg -f v4l2 -i /dev/video0 -vf scale=100:100 -f rawvideo pipe: | aplay -r 2000 -c2
```

<img src="/audio/terminal-procrastination/wf8.svg" width="100%" height="auto" /><audio controls="">
  <source src="/audio/terminal-procrastination/8.ogg" type="audio/ogg">
  <source src="/audio/terminal-procrastination/8.mp3" type="audio/mp3">
</audio>
```
ffmpeg -f v4l2 -i /dev/video0 -vf scale=6000:6000 -f rawvideo pipe: | aplay -r 2000 -c2
```

So yes ... you can try to pipe pretty much anything to your `aplay` ... hours of procrastination lie ahead.

And if `aplay` doesn't work for you, or you have a mac or something, you can always run this command in your terminal to get some colorfull glitches :

```bash
echo -e "#coding=utf8\nimport sys,random as r;c=0;p=' '*6\nwhile 1:p,c=(' '*r.randint(3,200),r.randint(20,99)) if r.random()>0.999 else (p,c);sys.stdout.write('\033[%sm'%c+('▚'*15 if r.random()>0.995 else '▚'*16)+p)" | python
```
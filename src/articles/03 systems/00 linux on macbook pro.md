# Linux on MacBook Pro

I recently switched from *MacOS* to *Linux*.

## WHY?

Because learning is fun.

## WHICH LINUX?

There are thousands of posts about which linux is the best. There isn't one
right answer. For me it's a distribution that reflects my values. I like to keep
things simple.

### HELLO, ARCH LINUX.

<img src="/images/linuxbookpro.jpg" alt="laptop" class="half-width-frame">

You can see from the output that Arch Linux is running on MacBook Pro
hardware. That's a screenshot of the terminal running *ZSH* and *TMUX*.
MacOS aka *Darwin*, is a BSD variant, and it's Unix-ish. So transitioning
to linux is easy and familiar.

<br/>

### GNOME DESKTOP
There are other desktop options, but *Gnome* basically gives you an improved
version of MacOS. I added some [MacOS icons][0] to make the transition more
seamless.

<img src="/images/desktop.png" alt="laptop" class="half-width-frame">

## HARDWARE PREREQUISITES

Before you do anything, you'll need a USB-C to USB hub. You can buy a cheap
keyboard and mouse to plug into it. You'll also need a USB drive. Get one with
a few gigabytes they are cheap.

<img src="/images/inputs.jpg" alt="laptop" class="half-width-frame">


## GETTING STARTED

### DISCLAIMER

This wont be a complete guide. I don't think a complete guide exists. You'll
need to do some searches to find solutions for issues specific to your machine.
Also, this could brick your computer. So don't do any of this unless you really
know how to *yolo*, k?

### OTHER GUIDES

The two best resources I found were [this][4] and [this][5]. And of course the
[arch wiki][6] was incredibly helpful. I got here by analyzing these resources
and doing some searches.

### BOOT FROM USB

Start by downloading the `ISO` from [here][1], pick a linke with *http*!
After you download it, [verify the signature][2].

You can use [this][3] app to make the USB bootable from the downloaded iso.

Plug everything in and turn your computer on while holding down the *command*
key. When the menu pops up, select your USB drive and continue booting it. Say
goodbye to MacOS, you're about to install Arch.

### FIRST BOOT

You'll see some logs and then you'll get dropped into a command line. The first
thing we're going to partition and format the disk. Your prompt is going to look
like `root@archiso ~ #`, the first command we're going to run is `lsblk`.

```
root@archiso ~ # lsblk
```

You'll see a list of bulk devices, mine looks like this but yours will look
different. I don't have a USB drive plugged in. You need to figure out which one
is your storage device and which one is your USB device. You can probably
determine that by the sizes of things.

```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
nvme0n1     259:0    0 233.8G  0 disk
├─nvme0n1p1 259:1    0   489M  0 part /boot
├─nvme0n1p2 259:2    0 222.6G  0 part /
└─nvme0n1p3 259:3    0  10.3G  0 part [SWAP]
```

## PARTITION

After you figure out your device's name, write it down, we're going to need it
again. Now, let's edit it. For example, if I was to edit my device, I would run
the following command.

```
root@archiso ~ # parted /dev/nvme01
```

You're in the partition editor. Next, destroy everything on the device.

```
mklabel gpt
```

Then with the next two commands create the boot partition.

```
mkpart ESP fat32 1049kB 538MB
set 1 boot on
```

> "Take the size of your hard disk, that you noted yourself earlier, and
> substract the size of your RAM from it. I’ve got 8GB of RAM, so for `SIZE`
> I’ve put in: 243GB (251GB minus 8GB)." - [Phil][4]

You might have to adjust these values, but try something like this to start.

```
mkpart primary ext4 538MB 243GB
mkpart primary linux-swap 243GB 100%
quit
```

## FORMAT

Next we're going to format the partitions. Run `lsblk` again to see the new
partitions you made, replace `foo` with your actual devicename.

```
mkfs.vfat -F32 /dev/foo1
mkfs.ext4 /dev/foo2
mkswap /dev/foo3
swapon /dev/foo3
```

If you get the error `Not enough clusters for a 32 bit FAT!`, try increasing the
size of your partition as discussed [here][7].

## BOOTSTRAP

Next we need to get the OS onto your newly partitoned and formatted device and
configure it.

### MOUNT
Let's mount the partitions, replacing `foo` with your actual device name.

```
root@archiso ~ # mount /dev/foo2 /mnt

root@archiso ~ # mkdir -p /mnt/boot
root@archiso ~ # mount /dev/foo1 /mnt/boot
```

### INSTALL

Select thr right mirror by moving it to the top of the list.

```
root@archiso ~ # vi /etc/pacman.d/mirrorlist
```

Run the `pacstrap` command to copy the OS onto your device.

```
root@archiso ~ # pacstrap /mnt base base-devel
```

### CONFIGURE
Generate your [File System Table][8] with this command.

```
root@archiso ~ # genfstab -U -p /mnt >> /mnt/etc/fstab
```

Open it with `vi`, there are some changes you'll need to make...

> "Make sure that the line of the ext4 partition ends with a `2`, the swap
> partition’s line ends with a `0`, and the boot partition’s line ends with a
> `1`. This configures the partition checking on boot." - [Phil][4]

```
root@archiso ~ # vi /mnt/etc/fstab
```

## CONFIGURE
Now change the root and configure the OS.

```
arch-chroot /mnt
```




[0]:https://www.gnome-look.org/p/1210856
[1]:https://www.archlinux.org/download
[2]:https://sparewotw.wordpress.com/2012/10/31/how-to-verify-signature-using-sig-file
[3]:https://www.balena.io/etcher
[4]:https://medium.com/@philpl/arch-linux-running-on-my-macbook-2ea525ebefe3
[5]:https://gist.github.com/roadrunner2/1289542a748d9a104e7baec6a92f9cd7
[6]:https://wiki.archlinux.org/index.php/Mac
[7]:https://bbs.archlinux.org/viewtopic.php?id=168014
[8]:https://en.wikipedia.org/wiki/Fstab

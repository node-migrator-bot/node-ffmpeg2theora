var ffmpeg2theora = new (require('../lib/ffmpeg2theora'))

ffmpeg2theora.batch([ '/home/bob/Downloads/dan.for.mayor.s02e02.hdtv.xvid-2hd.avi', '/home/bob/Downloads/cops.s23e21.readnfo.hdtv.xvid-2hd.avi'], '/home/bob/Downloads/', 'webm', {
	video : 9,   	//default is 5
	audio : 9 	//default is 5
})

ffmpeg2theora.setThreads(2)//set for the core count of your pc

setInterval(function() {
	console.log(ffmpeg2theora.getActive()[0],true,3)
}, 5500)

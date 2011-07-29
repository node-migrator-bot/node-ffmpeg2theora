var ffmpeg2theora = new (require('../lib/ffmpeg2theora'))

ffmpeg2theora.batch([ '/home/bob/Downloads/dan.for.mayor.s02e02.hdtv.xvid-2hd.avi', '/home/bob/Downloads/cops.s23e21.readnfo.hdtv.xvid-2hd.avi' ], '/home/bob/Downloads/', 'webm', {
	video : 9, // default is 5
	audio : 9
// default is 5
})

ffmpeg2theora.batch([ {
	source : '/home/bob/Downloads/video1.avi',
	dest : '/home/bob/downloads/video1'
},{
	source : '/home/bob/Downloads/video2.mkv'
},{
	source : '/home/bob/Downloads/video3.avi'
} ], {
	dest : '/home/bob/downloads',
	pingTime : 1200,
	quality : {
		video : 5,
		audio : 5
	},
	contaners : [ 'mp4', 'webm' ]
});

ffmpeg2theora.setThreads(2)// set for the core count of your pc


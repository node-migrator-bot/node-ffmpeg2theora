var ffmpeg2theora = new (require('../lib/ffmpeg2theora'))





ffmpeg2theora.on('video',function(video){
	
})



ffmpeg2theora.batch([ {
	source : '/home/bob/Downloads/Haven.S02E01.A.Tale.of.Two.Audreys.720p.WEB-DL.DD5.1.h.264-PiLAF.mkv',
	dest : '/home/bob/Downloads/video1'
}], {
	pingTime : 1200,//poll info from the spawn
	quality : {
		video : 5,//set the quality of the encode
		audio : 5//set the quality of the encode
	},
	contaners : [ 'mp4', 'webm' ]//what formats you want to encode to.
});

setTimeout(function(){
	
	console.log(ffmpeg2theora.factory)
	
}, 10000)




ffmpeg2theora.setThreads(2)// set for the core count of your pc


const e = require("express");
const { joinClass } = require("../../routes/api/v1/student/class/class_controller");

var rooms = [];
let room;

module.exports = function (wsServer, socket, app) {
    const dbModels = global.DB_MODELS;

    const socketComclass = wsServer.of("/socketComclass");


    // join room
    socket.on("join:class", async (data) => {
        console.log("join Class:", data.subject);
        socket.join(data._id);
        console.log(data)
        socket.classId = data._id;
        socket.currentMembers = data.currentMembers

        ///////////////////////////////////////////////////////////
        // Create Room
        room = data._id;
        if (rooms[room] == undefined) {
            console.log('room create :' + room);
            rooms[room] = new Object();
            rooms[room].socket_ids = new Object();
        }
        ////////////////////////////////////////////////////////////

        socket.teacher = data.teacher
        if (data.role == 'teacher') {
			// Store current user's nickname and socket.id to MAP
			rooms[room].socket_ids[data.teacher] = socket.id
            console.log("teacher:", data.teacher)
            console.log(rooms[room].socket_ids[data.teacher])
        }

        if (data.studentName) {
			// Store current user's nickname and socket.id to MAP
			rooms[room].socket_ids[data.studentName] = socket.id
            meetingInfo = await dbModels.Meeting.findOneAndUpdate({
                _id: socket.classId
            },
                {
                    $push: { currentMembers: { studentName: data.studentName } }
                },
                {
                    new: true
                }
            );
            socket.studentName = data.studentName
            console.log("studentName:", data.studentName)
            console.log(rooms[room].socket_ids[socket.studentName])

            socketComclass.to(socket.classId).emit("update:classInfo", meetingInfo);
        } else {
            socketComclass.to(socket.classId).emit("update:classInfo", data);
        }

        const userCount = socket.adapter.rooms.get(socket.classId)?.size;

        console.log("current member number:", userCount)
        // 자기 자신 포함 같은 room에 있는 사람들에게 현재 접속자 수 전달
        socketComclass.to(socket.classId).emit("studentCount", userCount);



    });





    // monitoring
    socket.on('begin:monitoring', () => {
        console.log(" ( teacher <-- student ) 'begin:monitoring'");

        socketComclass.to(socket.classId).emit("begin:monitoring", '');
    })

    // monitoring
    socket.on('send:monitoringCanvas', (data) => {
        console.log(" ( teacher <-- student ) 'send:monitoringCanvas'")

        var sendData = {
            classId: socket.classId,
            // drawingEvent  : drawingEvent,
            documentInfo: data.documentInfo,
            pageNum: data.pageInfo,
            studentName: data.studentName
        };

        socketComclass.to(socket.classId).emit("send:monitoringCanvas", data);
    });


    /*------------------------------------------        
        begin Guidance             
    -------------------------------------------*/
    socket.on('begin:guidance', (name) => {
        console.log("\n ( teacher --> student ) 'begin:guidance'")
		socket_id = rooms[room].socket_ids[name]; // room 안에 있는 특정 socket 찾기

        // 기존 학생 monitoring 취소 먼저
        socket.broadcast.to(socket.classId).emit("cancel:guidance");
		
		socket.oneOnOneTarget = name; // 소켓에 1대1 모드 상대 이름 저장
        // 해당 학생 monitoring 시작
        socket.to(socket_id).emit("get:studentViewInfo") //특정 socketid에게만 전송        
    });

	/*------------------------------------------        
	set:studentViewInfo           
	-------------------------------------------*/
	socket.on('set:studentViewInfo', (currentDocId, currentDocNum, currentPage, zoomScale, drawData) => {
		console.log('currentDocId: ', currentDocId)
		console.log('currentDocNum: ', currentDocNum)
		console.log('currentPage: ', currentPage)
		console.log('zoomScale: ', zoomScale)
		console.log('drawData: ', drawData)
		console.log("\n ( student --> teacher ) 'set:studentViewInfo'")
		socket_id = rooms[room].socket_ids[socket.teacher]; // room 안에 있는 특정 socket 찾기

        console.log('student in room : ',rooms[room].socket_ids[socket.studentName])
        console.log('teacher in room : ',socket_id)
		const data = {
            studentName: socket.studentName,
			currentDocId: currentDocId,
			currentDocNum: currentDocNum,
			currentPage: currentPage,
			zoomScale: zoomScale,
			drawData: drawData,
		}
		socket.to(socket_id).emit("teacher:studentViewInfo", data) //특정 socketid에게만 전송
        console.log("teacher:studentViewInfo :", data )
	});


    /*------------------------------------------        
	    cancel:monitoring           
	-------------------------------------------*/
    socket.on('cancel:monitoring', () => {
        console.log("\n ( teacher --> student ) 'cancel:monitoring'")
		socket.oneOnOneTarget='';
        // 학생 monitoring 취소
        socket.broadcast.to(socket.classId).emit("cancel:guidance");
    });




    // disconnect
    socket.on("disconnect", async function () {
        console.log("\n ---> class:disconnected:", socket.classId);
        if (!socket.studentName) {
            console.log("disconnect teacher: ", socket.teacher)
			delete rooms[room].socket_ids[socket.teacher];
        }
        if (socket.studentName) {
            console.log("disconnect student: ", socket.studentName)
            const meetingInfo = await dbModels.Meeting.findOneAndUpdate({
                _id: socket.classId
            },
                {
                    $pull: { currentMembers: { studentName: socket.studentName } }
                },
                {
                    new: true
                }
            );
            console.log("currentMembers: ", meetingInfo?.currentMembers)
            socketComclass.to(socket.classId).emit("update:classInfo", meetingInfo);
			delete rooms[room].socket_ids[socket.studentName];
        }

        if (socket.classId) {
            socket.leave(socket.classId);
        }

        const userCount = socket.adapter.rooms.get(socket.classId)?.size;

        // 자기 자신 포함 같은 room에 있는 사람들에게 현재 접속자 수 전달
        socketComclass.to(socket.classId).emit("studentCount", userCount);
    });

    /**
     *  새로운 document 생성 시 진입
     *  - room 안의 모든 User에게 전송 (보낸 사람 포함)
     *  - code 통일성을 위해서!
     */
    socket.on("check:documents", (meetingRoomId) => {
        console.log(meetingRoomId)
        socketComclass.to(meetingRoomId).emit("check:documents");
    });

    socket.on("draw:teacher", async (data) => {
		console.log('data : ', data)
		console.log('data.drawingEvent.participantName : ', data.drawingEvent.participantName)
		console.log('data.drawingEvent.oneOnOneMode : ', data.drawingEvent.oneOnOneMode)

		if (data.drawingEvent.oneOnOneMode == false){
			socket.broadcast.to(socket.classId).emit("draw:teacher", data);
		} 
		else if (data.drawingEvent.participantName != 'teacher' && data.drawingEvent.oneOnOneMode == true){
			socket_id = rooms[room].socket_ids[socket.teacher];
			console.log('socket_id : ', socket_id)
			console.log('socket.teacher : ', socket.teacher)
			socket.to(socket_id).emit("draw:teacher", data)
		}
		// else if (data.participantName == 'teacher' && data.drawingEvent.oneOnOneMode == true){
		// 	socket_id = rooms[room].socket_ids[socket.oneOnOneTarget];
		// 	console.log('socket_id : ', socket_id)
		// 	console.log('socket.oneOnOneTarget : ', socket.oneOnOneTarget)
		// 	socket.to(socket_id).emit("draw:teacher", data)
		// } 
        // // console.log(data)
        const drawData = {
            pageNum: data.pageNum,
            drawingEvent: data.drawingEvent,
        };

        // tool이 포인터이면 드로잉 이벤를 저장하지 않는다.
        var res = {};
		// if (data.drawingEvent.tool.type != "pointer" && data.participantName == 'teacher' && data.mode == 'syncMode') {
		if (data.drawingEvent.tool.type != "pointer" && data.drawingEvent.participantName == 'teacher' && data.drawingEvent.oneOnOneMode == false)  {
            res = await dbModels.Doc.findOneAndUpdate({ _id: data.docId }, { $push: { drawingEventSet: drawData } });
        }
    });


    // // 모니터링모드의 학생이 그린 그림 선생님에게 그리기
    // socket.on("send:monitoringCanvasDrawEvent", async (data) => {
    //     console.log('student --------> teacher draw event')
    //     socket.broadcast.to(socket.classId).emit("send:monitoringCanvasDrawEvent", data);
    // });





    socket.on("clearDrawingEvents", async (data) => {
		if (data.participantName == 'teacher' && data.oneOnOneMode == false){
        	res = await dbModels.Doc.findOne({ '_id': data.docId }, { '_id': false, 'meetingId': true })

        	socket.broadcast.to(socket.classId).emit("clearDrawingEvents", data);

        	result = await dbModels.Doc.findOneAndUpdate(
        	    {
        	        _id: data.docId,
        	        // 'drawingEventSet.pageNum' : req.query.currentPage
        	    },
        	    {
        	        $pull: {
        	            drawingEventSet: {
        	                pageNum: data.currentPage,
        	            },
        	        },
        	    }
        	);
		} 
		else if (data.participantName != 'teacher'){
			socket_id = rooms[room].socket_ids[socket.teacher];
			socket.to(socket_id).emit("clearDrawingEvents", data);
		}
	});

    socket.on("change:pdfNum", (data) => {
        console.log(data);
        socket.broadcast.to("testRoom").emit("change:pdfNum", data);
    });

    /*-------------------------------------------
    doc 전환 하는 경우 sync
 	---------------------------------------------*/
    socket.on("sync:doc", (data) => {
		console.log("page to sync: ", data.docId);
		socket.broadcast.to(data.meetingId).emit("sync:docChange", data.docId);
    });

	/*-------------------------------------------
	doc 전환 하는 경우 oneOneOneMode
	---------------------------------------------*/
	socket.on("oneOnOneMode:doc", (data) => {
		console.log("page to sync: ", data.docId);
		socket_id = rooms[room].socket_ids[socket.teacher]; // room 안에 있는 특정 socket 찾기
		socket.to(socket_id).emit("sync:docChange", data.docId);
	});


    /*-------------------------------------------
    page 전환 하는 경우 sync
 ---------------------------------------------*/
    socket.on("sync:page", (data) => {
        console.log("doc to sync: ", data.docId);
        console.log("page to sync: ", data.pageNum);
        socket.broadcast.to(data.meetingId).emit("sync:pageChange", data);
    });

	

    /*-------------------------------------------
    doc. List (문서 목록으로) 하는 경우 sync
 ---------------------------------------------*/
    socket.on("sync:FileList", (data) => {
        console.log("back to FileList sync: ");
        socket_id = rooms[room].socket_ids[socket.teacher]; // room 안에 있는 특정 socket 찾기
        socket.to(socket_id).emit("sync:backToFileList");
    });
};

const e = require("express");
const { joinClass } = require("../../routes/api/v1/student/class/class_controller");

module.exports = function (wsServer, socket, app) {
    const dbModels = global.DB_MODELS;

    const socketComclass = wsServer.of("/socketComclass");


    // join room
    socket.on("join:class", async (data) => {
        console.log("join Class:", data.subject);
        socket.join(data._id);
        socket.classId = data._id;
        if (data.teacher) {
            socket.teacher = data.teacher
            console.log("teacher:", data.teacher)
        }
		
        if (data.studentName) {
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
    socket.on('send:monitoringCanvas', (data) => {
		console.log(" ( teacher <-- student ) 'send:monitoringCanvas'")
    
        var sendData = {
            classId    : socket.classId,
            // drawingEvent  : drawingEvent,
            documentInfo: data.documentInfo,
            pageNum     : data.pageInfo,
            studentName: data.studentName
        };

        socketComclass.to(socket.classId).emit("send:monitoringCanvas", sendData);
	});





    // disconnect
    socket.on("disconnect", async function () {
        console.log("\n ---> class:disconnected:", socket.classId);
        if (!socket.studentName) {
            console.log("disconnect teacher: ", socket.teacher)
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
        console.log('client --------> server draw event')
        socket.broadcast.to(socket.classId).emit("draw:teacher", data);
        // console.log(data)
        const drawData = {
            pageNum: data.pageNum,
            drawingEvent: data.drawingEvent,
        };

        // tool이 포인터이면 드로잉 이벤를 저장하지 않는다.
        var res = {};
        if (data.drawingEvent.tool.type != "pointer" && data.participantName == 'teacher' && data.mod == 'syncMode')  {
            res = await dbModels.Doc.findOneAndUpdate({ _id: data.docId }, { $push: { drawingEventSet: drawData } });
        }
    });

    socket.on("clearDrawingEvents", async (data) => {
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
        socket.broadcast.to(data.meetingId).emit("sync:backToFileList");
    });
};

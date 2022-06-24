module.exports = function (wsServer, socket, app) {
    const dbModels = global.DB_MODELS;

    const socketComclass = wsServer.of("/socketComclass");

    socket.on("join:class", (data) => {
        console.log(data)
        console.log("join Class:", data.subject);
        socket.join(data._id);
        socket.classId = data._id;
        if(data.teacher){
            socket.teacher = data.teacher
            console.log("teacher:", data.teacher)
        }
        if (data.studentName) {
            socket.studentName = data.studentName
            console.log("studentName:", data.studentName)
        }

    });

    socket.on("disconnect", async function () {
        console.log("\n ---> class:disconnected:", socket.classId);
        if (!socket.studentName) {
            console.log("disconnect teacher: ", socket.teacher)
        }
        if (socket.studentName){
            console.log("disconnect student: ", socket.studentName)
            const meetingInfo = await dbModels.Meeting.findOneAndUpdate({
                    _id: socket.classId
                },
                {
                    $pull: { currentMembers: { studentName : socket.studentName} }
                },
                {
                    new: true
                }
            );
            console.log(meetingInfo?.currentMembers)
        }
        if (socket.classId) {
            socket.leave(socket.classId);
        }
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
        if (data.drawingEvent.tool.type != "pointer") {
            res = await dbModels.Doc.findOneAndUpdate({ _id: data.docId }, { $push: { drawingEventSet: drawData } });
        }
    });

    socket.on("clearDrawingEvents", async (data) => {
        res = await dbModels.Doc.findOne({ '_id': data.docId }, {'_id':false,'meetingId':true})

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

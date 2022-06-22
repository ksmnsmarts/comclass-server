const mongoose = require('mongoose');


const docSchema = mongoose.Schema(
    {
        meetingId: {
            type: String
        },

        originalFileName: {
            type: String
        },
        fileName: {
            type: String
        },
        uploadUser: {
            type: String,
            // required: true, unique: true 
        },
        saveKey: {
            type: String
        },
        fileSize: {
            type: String
        },
        drawingEventSet: [
            {
                _id: false,
                pageNum: { type: Number },
                drawingEvent: {
                    type: Object
                    // point: [],
                    // timeDiff: { type: Number },
                    // tool: {
                    //   color: {
                    //     type: String
                    //   },
                    //   type: {
                    //     type: String
                    //   },
                    //   width: {
                    //     type: Number
                    //   },
                    // },

                }

            }
        ],
    }, 
    {
        timestamps: true
    }
);

const Doc = mongoose.model('Doc', docSchema)

module.exports = Doc;
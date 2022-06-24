const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema(
    {
        teacher: {
            type: String
        },
        subject: {
            type: String
        },

        manager: 
        {
            _id: false, // 추가 : array 내에 object ID 생성 안함
            manager_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Admin',
            },
            manager_email: {
                type: String
            },
            manager_name: {
                type: String
            }
        }
        ,
        currentMembers: [
            {
                _id: false, // 추가 : array 내에 object ID 생성 안함
                studentName: {
                    type: String
                }
            }
        ],

        // 실시간 미팅에서 쓰이는 currentMembers
        // currentMembers: [
        //     {
        //         _id: false, // 추가 : array 내에 object ID 생성 안함
        //         member_id: {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: 'Member',
        //         },
        //         role: {
        //             type: String
        //         },
        //         online: {
        //             type: Boolean
        //         }
        //     }
        // ],

        // 회의가 pending, open ,close인지 상태를 보여준다.
        status: {
            type: String
        },
        start_date: {
            type: Date
        },
        start_time: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;



const { ObjectId } = require("mongodb");
const { db } = require("../utils/connectDb");

const getJobStatus = async (req, res) => {
    try {
        const { postid, userid } = req.body;

        // Validate that the ids are valid ObjectIds
        if (!ObjectId.isValid(postid) || !ObjectId.isValid(userid)) {
            return res.status(400).json({
                message: 'Invalid post ID or user ID format',
                data: null,
                isSuccess: false,
            });
        }

        const jobstatus = await db.jobstatus.find({
            postid: new ObjectId(postid),
            userid: new ObjectId(userid),
        }).toArray();


        if (!jobstatus) {
            // Job status not found
            return res.status(404).json({
                message: 'Job status not found',
                data: null,
                isSuccess: false,
            });
        }

        // Job status found
        return res.status(200).json({
            message: 'Get job status successful',
            data: jobstatus,
            isSuccess: true,
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({
            message: 'Failed to fetch job status',
            data: null,
            isSuccess: false,
        });
    }
};

const updateJobStatus = async (req, res) => {
    const { status, candidateInfo } = req.body;
    try {
        const id = req.params.id;

        // Validate that the id is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid job status ID format',
                data: null,
                isSuccess: false,
            });
        }

        await db.jobStatus.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status,
                    candidateInfo,
                },
            }
        )
        res.status(200).json({
            message: "Update job status by id successful",
            data: { ...req.body, id: id },
            isSuccess: true,
        });
    } catch (error) {
        console.error('Error updating job status by ID:', error);
        res.status(500).json({
            message: 'Failed to update job status by ID',
            data: null,
            isSuccess: false,
        });
    }
};
const createJobStatus = async (req, res) => {
    const { postid, userid, status, candidateInfo } = req.body;
    console.log(candidateInfo);
    try {
        const newJobStatus = {
            postid: new ObjectId(postid),
            userid: new ObjectId(userid),
            status,
            candidateInfo,
        };

        const result = await db.jobstatus.insertOne(newJobStatus);

        if (result.acknowledged) {
            res.status(201).json({
                message: "Create job status successful",
                data: { ...req.body, _id: result.insertedId },
                isSuccess: true,
            });
        } else {
            throw new Error('Insert operation not acknowledged');
        }
    } catch (error) {
        console.error('Error creating job status:', error);
        res.status(500).json({
            message: 'Failed to create job status',
            data: null,
            isSuccess: false,
        });
    }
};

const getJobStatusByAuthor = async (req, res) => {
    try {
        const authorid = req.params;

        // Validate that the id is a valid ObjectId
        if (!ObjectId.isValid(authorid)) {
            return res.status(400).json({
                message: 'Invalid user ID format',
                data: null,
                isSuccess: false,
            });
        }

        // Get the posts associated with the authorid
        const posts = await db.posts.find({
            "author._id": new ObjectId(authorid),
        }).toArray();

        // For each post, find the count of jobstatus
        for (let post of posts) {
            const jobStatusCount = await db.jobstatus.countDocuments({
                postid: new ObjectId(post._id),
            });
            const jobStatusItem = await db.jobstatus.find({
                postid: new ObjectId(post._id),
            }).toArray();
            post.jobStatusCount = jobStatusCount;
            // Khởi tạo post.userapply như một array trước khi thêm các phần tử
            post.userapply = []; // Thêm dòng này
            for (let job of jobStatusItem) {
                const user = await db.users.findOne({
                    _id: new ObjectId(job.userid),
                });
                // Bây giờ bạn có thể sử dụng spread operator mà không gặp lỗi
                post.userapply = [...post.userapply, user];
            }
        }
        console.log(posts)
        // Return the posts with job status count
        return res.status(200).json({
            message: 'Get job status by author successful',
            data: posts,
            isSuccess: true,
        });
    } catch (error) {
        console.error('Error fetching job status by author:', error);
        res.status(500).json({
            message: 'Failed to fetch job status by author',
            data: null,
            isSuccess: false,
        });
    }
};

module.exports = {
    getJobStatus,
    updateJobStatus,
    createJobStatus,
    getJobStatusByAuthor,
};
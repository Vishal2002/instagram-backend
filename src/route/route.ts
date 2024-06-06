import express from 'express';
import {likePost,login,Follow,bookMark,unFollow,signup,sharePost,search,healthCheckup,uploadPost,deletePost, getUserPost, comment, getComments} from '../controller/controller'
import {upload} from '../middleware/upload';
import { UserSchema,PostSchema,LoginSchema,CommmentSchema } from "../config/validation";

import { validateRequest } from '../middleware/validateMiddleware';
const router=express.Router();
// console.log(healthCheckup,"healthCheckup");
router.get('/',healthCheckup);
router.post('/signup', validateRequest(UserSchema), signup);
router.post('/login', validateRequest(LoginSchema), login);
router.post('/post', validateRequest(PostSchema),upload.single('image'), uploadPost);
router.post('/like/:postId',likePost);
router.post('/follow/:followerId',Follow);
router.delete('/unfollow/:followerId',unFollow);
router.patch('/deletePost/:postId',deletePost);
router.post('/bookMark/:postId',bookMark);
router.get('/mypost',getUserPost);
router.post('/comment/:postId',validateRequest(CommmentSchema),comment);
router.get('/comments/:postId',getComments);






export default router;



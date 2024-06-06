import express, { Request, Response } from "express";
import { PrismaClient, User,Post,Follow,Comment, Like,Bookmark } from "@prisma/client";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { decodeToken, creteToken } from "../helper/jwtHelper";
import { FileUpload } from "../config/uploadConfig";
const prisma = new PrismaClient();
prisma.$connect().then(() => {
  console.log('Connected to PostgreSQL database successfully.');
}).catch(error => {
  console.error('Failed to connect to PostgreSQL database:', error);
});

type UploadedFile=File &{
  location: string;
}

type UserInfo = User | null;

export async function login(req: Request, res: Response) {
  try {

    const { username, password } = req.body;
    const existingUser: UserInfo = await prisma.user.findUnique({
      where: { username: username},
    });

    if (!existingUser) {
      res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found!!!" });
    } else {
      const isCorrectPassword = await bcrypt.compare(
        password,
        existingUser.password || ""
      );

      if (!isCorrectPassword) {
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "Invalid password" });
      } else {
        const token = creteToken({
          username: existingUser.username,
          userId: existingUser.id,
          
        });
        res.status(httpStatus.OK).json({token:token, message: "Login Successfully!!" });
      }
    }
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // Check if user with the same email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(httpStatus.CREATED).json({ user: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
}

export async function uploadPost(req: Request, res: Response) {
   try {
   const token=req.headers.authorization?.split(' ')[1];
   const userId=decodeToken(token||"")?.userId;
   const {caption}=req.body;
   const uploadedFile = req.file as UploadedFile|undefined;
   if (!uploadedFile || !uploadedFile.location) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "File not provided" });
  }

  const newPost = await prisma.post.create({
    data: {
      userId: userId as number,
      caption: caption as string,
      url: uploadedFile.location as string,
    },
  });

   res.status(httpStatus.CREATED).json({data:newPost,message:"Post Created Successfully!!!"});
                   
   } catch (error) {
      console.error(error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error" });
   }
}

export async function comment(req: Request, res: Response) {
try {
  const token=req.headers.authorization?.split(' ')[1];
  const userId=decodeToken(token||"")?.userId;
  const {content}=req.body;
  const postId=req.params.postId;
 
  const newComment=await prisma.comment.create({
    data:{
     postId:parseInt(postId),
     userId:userId,
     content:content as string
    } as Comment
  })

  const creator=await prisma.comment.findFirst({
    where:{
      postId:parseInt(postId),
    },
    include: {user:true}
  })
  
 res.status(httpStatus.CREATED).json({message:`Commented on the Post of  @${creator?.user?.username}`})

  
} catch (error) {
  console.error(error);
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error" });

}
}

export async function getComments(req: Request, res: Response) {

}

export async function deletePost(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const postId = req.params.postId;
    const existingPost = await prisma.post.findFirst({
      where: {
        id: parseInt(postId),
        userId: userId, 
      },
    });

    if (!existingPost) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Post not found or you are not authorized to delete this post' });
    }
    const deletedPost = await prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: {
        isDeleted: true,
      },
    });

    res.status(httpStatus.OK).json({deletedPost, message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
}

export async function getUserPost(req: Request, res: Response){
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const posts=await prisma.post.findMany({
     where: {userId: userId, isDeleted: false},
    })
    
    res.status(httpStatus.CREATED).json({posts: posts,message:"Total User Posts"});


  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal Server Error'});
  }

}
 

export async function privateAccount(req: Request, res: Response) {

}

export async function likePost(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const postId = req.params.postId;

    const existingLike = await prisma.like.findFirst({
      where: {
        postId: parseInt(postId),
        userId: userId,
      },
    });

    if (existingLike) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'You have already liked this post' });
    }

  
    const likedPost = await prisma.like.create({
      data: {
        postId: parseInt(postId),
        userId: userId,
      } as Like,
    });

    res.status(httpStatus.CREATED).json({ likedPost, message: 'Liked the Post' });
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
}

export async function sharePost(req: Request, res: Response) {

}

export async function bookMark(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const postId = req.params.postId;
    const isBookmarked = await prisma.bookmark.findFirst({
      where: {
          userId: userId,
          postId: parseInt(postId)
      }
  })
  
    
    
  if(!isBookmarked) {
    const bookMarked=await prisma.bookmark.create({
      data:{
       postId: parseInt(postId),
       userId: userId
      } as Bookmark
     });
    res.status(httpStatus.OK).json({bookMarked,message:"Bookmarked Successfully"});
  }
  else{
    res.status(httpStatus.BAD_REQUEST).json({message:"Bookmarked Failed"});
  }
  
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message:"Internal Server Error" });
  }
}

export async function search(req: Request, res: Response) {}

export async function getNotification(req: Request, res: Response) {}

export async function getProfile(req: Request, res: Response) {}

export async function editProfile(req: Request, res: Response) {}

export async function getFollower(req: Request, res: Response) {

}

export async function getFollowing(req: Request, res: Response) {}

export async function Follow(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const followingId = req.params.followerId;
    const isUserExist=await prisma.user.findFirst({
      where:{
        id:userId
      }
    })
    if(!isUserExist){
     res.status(httpStatus.NOT_FOUND).json({message:"Please Login to your Account or Make a new Account!!"});
    }
    else{
      const isRelationExist = await prisma.follow.findFirst({
        where: {
          followerId:parseInt(followingId),
          followingId:userId ,
        },
      });
  
      if (!isRelationExist) {
       const newFollower= await prisma.follow.create({
          data: {
            followerId:parseInt(followingId) ,
            followingId:userId as number ,
          } 
        });
        res.status(httpStatus.OK).json({newFollower, message: 'Followed successfully' });
      } else {
        res.status(httpStatus.CONFLICT).json({message:"Already Follwed"})
      }
  
    }
    
    
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
}

export async function unFollow(req: Request, res: Response){
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = decodeToken(token || '')?.userId;
    const followingId = req.params.followerId;
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId: parseInt(followingId) ,
        followingId: userId,
      },
    });

    if (!existingFollow) {
      throw new Error('Relation does not exist');
    }

    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.status(httpStatus.OK).json({ message: 'Unfollowed successfully' });
    
  } catch (error) {
    console.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message:"Internal Server Error"});
  }
}

export async function healthCheckup(req: Request, res: Response) {
  try {
    res.send("Health Check");
  } catch (error) {
    console.log(error);
  }
}

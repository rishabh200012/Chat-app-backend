import { Message } from "../model/message.model.js";

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversationId,
    }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// export const sendMessage = async (req, res, next) => {
//   try {
//     const senderId = req.user.id;

//     const { conversationId, text } = req.body;

//     const message = await Message.create({
//       conversationId,
//       sender: senderId,
//       text,
//     });

//     return res.status(201).json({
//       success: true,
//       message,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

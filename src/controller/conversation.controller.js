import { Conversation } from "../model/conversation.modal.js";

export const createOrGetConvo = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { receiverId } = req.body;
    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, receiverId],
      },
      isGroup: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, receiverId],
      });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

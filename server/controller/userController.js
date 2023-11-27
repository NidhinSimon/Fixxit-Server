
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToke.js";
import Service from "../models/serviceModel.js";
import Category from '../models/CategoryModel.js'
import Booking from "../models/BookingModel.js";
import Provider from "../models/providerModel.js";
import Report from "../models/ReportModel.js";
import axios from 'axios'

import Wallet from '../models/wallerHistoryModal.js'

const registerUser = async (req, res) => {

  const { name, email, mobile } = req.body
  const userExists = await User.findOne({ mobile })
  if (userExists) {

    res.json({ message: 'User already exists' });

  } else {
    const user = await User.create({
      name,
      email,
      mobile,
      role:'user'
    })
    if (user) {
      const token = generateToken(res, user._id)
      console.log("inside if")
      res.status(200).json({
        userExists,
        token
      })
      console.log(token, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    } else {
      console.log("something went wrong")
    }
  }
}


const checkNumber = async (req, res) => {
  const { mobile } = req.body

  const user = await User.findOne({ mobile })
  if (user) {
    res.json({ message: "user exists" })
  } else {
    res.json({ message: "user not registered" })
  }
}



const loginUser = async (req, res) => {
  try {
    const { number } = req.body;


    const userExists = await User.findOne({ mobile: number });

    if (userExists) {
      const token = generateToken(res, userExists._id)
      console.log(token,"---------------------------------")
      console.log("User exists:", userExists);
      res.json({
        message: "User login successful",
        userExists,
        token
      });
    } else {
      console.log("User not registered");
      res.json({ message: "not found" })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const verifyGoogle = async (req, res) => {
  console.log(req.body,'///')
  const { email } = req.body
  console.log(email, "-------")

  try {


    const userExists = await User.findOne({ email: email })
    if (userExists) {
      const token = generateToken(res, userExists._id)
      console.log("User exists:", userExists);
      res.json({
        message: "User login successful",
        userExists,
        token
      });
    } else {
      console.log("User not registered");
      res.json({ message: "User not registered" })
    }

  } catch (error) {
    console.log(error.message)
  }
}


const removeWishlist=async(req,res)=>{
  console.log("ssss")
  const {userId,itemId}=req.params

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    user.wishlist.pull(itemId);
    await user.save();

    res.json(user.wishlist);
  } catch (error) {
    console.log(error.message)
  }
}



  const verifyFb = async (req, res) => {
    console.log("-------------------------------------------------------------------------------------------------------------------------", req.body);
    const { accessToken } = req.body; 
  
    try {
      const response = await axios.get(`https://graph.facebook.com/v15.0/me?access_token=${accessToken}&fields=id,email,name`);
  
      const { id, email, name } = response.data;
      console.log(response,'=========================================')
  
      const userExists = await User.findOne({ email: email });
  
      if (userExists) {
        const token = generateToken(res, userExists._id);
        console.log("User exists:", userExists);
        res.json({
          message: "User login successful",
          userExists,
          token
        });
      } else {
        // User does not exist, send a notification
        console.log("User not registered");
        res.status(404).json({ message: "No account associated with this email" });
      }
  
    } catch (error) {
      console.error('Error verifying Facebook token:', error);
      res.status(500).json({ message: 'Error verifying Facebook token' });
    }
  }
  


const getServices = async (req, res) => {
  console.log(req.params.id)
  const { id } = req.params
  const filteredServices = await Service.find({ category: id });

  res.json(filteredServices);
}


const getCategory = async (req, res) => {
  console.log(req.params.id)
  const { id } = req.params

  const categoryname = await Category.findById(id)
  res.json(categoryname)
}


const saveaddress = async (req, res) => {
  const { address, userid, latitude, longitude } = req.body;

  try {
    const user = await User.findById(userid);

    if (!user) {
      return res.json({ message: "No user exists" });
    }

    user.addresses.push({
      address,
      latitude,
      longitude,
    });

    await user.save();

    return res.json({ message: "User address saved" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const logoutUser = async (req, res) => {
  res.cookie('usertoken', "", {
    httpOnly: true,
    expires: new Date(0)
  })
  res.status(200).json({ message: "LOGOUT USER" })
}

const profileget = async (req, res) => {
console.log("sijsisui")
  const user = await User.findById(req.params.id)
  console.log(user,"------------")

  res.json(user)
}


const profileEdit = async (req, res) => {
  console.log(req.params.id, "---------------------------")
  const { name, email, mobile } = req.body

  try {
    const updatedService = await User.findByIdAndUpdate(req.params.id, { $set: { name, email, mobile } }, { new: true });
    res.json(updatedService);
    console.log(updatedService, ">>>>>>>>>>>>>>>>>>>>>>>>");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the user.' });
  }

}

// const addtocart = async (req, res) => {
//   try {
//     const { cartData, userId } = req.body;
//     console.log("Received cartData:", cartData);
//     console.log("Received userId:", userId);

//     // Find the user by their ID
//     const user = await User.findById(userId);
//     console.log("Found user:", user);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Check if the item already exists in the cart
//     const existingCartItem = user.cart.find((item) => item._id.toString() === cartData._id);

//     if (existingCartItem) {
//       // If the item already exists, replace it with the new one
//       Object.assign(existingCartItem, cartData);
//     } else {
//       // If the item doesn't exist, add it to the cart
//       user.cart.push(cartData);
//     }

//     console.log("Updated user's cart:", user.cart);

//     const savedCart = await user.save();
//     console.log(savedCart);
//     res.status(200).json({
//       cart: savedCart.cart,
//       message: "Cart updated successfully"
//     });
//   } catch (error) {
//     console.error("Error updating user's cart:", error);
//     res.status(500).json({ error: "An error occurred while updating the user's cart" });
//   }
// };



const addtocart = async (req, res) => {
  console.log(req.body, '------');
  try {
    const { cartData, userId } = req.body;
    console.log("Received cartData:", cartData);
    console.log("Received userId:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the item already exists in the cart
    const existingCartItemIndex = user.cart.findIndex(item => item.serviceId.equals(cartData.serviceId));

    if (existingCartItemIndex !== -1) {
      // If the item already exists, you can choose to inform the client or just return
      return res.status(400).json({ message: "Service already exists in the cart" });
    }

    // If the item doesn't exist, add it to the cart
    user.cart.push(cartData);

    console.log("Updated user's cart:", user.cart);

    const savedCart = await user.save();
    console.log(savedCart);
    res.status(200).json({
      cart: savedCart.cart,
      message: "Cart updated successfully"
    });
  } catch (error) {
    console.error("Error updating user's cart:", error);
    res.status(500).json({ error: "An error occurred while updating the user's cart" });
  }
};



const getcart = async (req, res) => {
  const userid = req.params.id
  console.log(userid, ">>>>>>>>>>")
  const user = await User.findById(userid).select('cart')
  console.log(
    user, ">>>>"
  )
  res.json(user.cart)


}

const deletecart = async (req, res) => {
  const userid = req.params.id
  const serviceId = req.params.serviceId
  console.log(serviceId, userid)
  const user = await User.findByIdAndUpdate(userid, { $pull: { cart: { serviceId: serviceId } } }, { new: true })

  res.json(user.cart);


}

const getBookings = async (req, res) => {
  console.log("ISISYISUIUSISUISUISUISUISUSIUSIUSIUISUISUISUISUISUSIUSIUSIUSIUISUSIUISUSIUSIUSI")
  const { id } = req.params;
  try {
    const userbookings = await Booking.find({ userId: id });
    console.log(userbookings, "odiododuodudodu")

    if (!userbookings || userbookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }

    let providerInfo = null;

    for (const booking of userbookings) {
      if (booking.provider) {
        const provider = await Provider.findById(booking.provider);
        if (provider) {
          providerInfo = {
            name: provider.name,
            age: provider.age,
            mobile: provider.mobile,

          };
          break;
        }
      }
    }
    console.log(providerInfo, "diyidydiydiydiydiyd")

    if (!providerInfo) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.json({ success: true, providerInfo });
  } catch (error) {
    console.error("Error fetching bookings and provider:", error);
    return res.status(500).json({ success: false, message: "Error fetching bookings and provider" });
  }
};




const userBookings = async (req, res) => {
  const { id } = req.params

  const userBoooking = await Booking.find({ userId: id })


  res.json(userBoooking)
}


const canceluser = async (req, res) => {
  const { id } = req.params

  const booking = await Booking.findById(id)

  booking.status = 'canceled'

  await booking.save()
  const userId = booking.userId
  const user = await User.findById(userId)

  user.Wallet += booking.Total



  // const adminemail=process.env.ADMIN_EMAIL

  // const admin=await Admin.findOne({email:adminemail})

  // admin.Wallet-=booking.Total
  // await admin.save()

  await user.save()

  const walletHistoryEntry = new Wallet({
    userId: userId,
    amount: booking.Total,
    reason: "Booking cancelled",
    type: "Credit",
  });

  await walletHistoryEntry.save()


  res.json({ success: true })
}

const reportProvider = async (req, res) => {
  console.log(req.body, ":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::")
  const { reportReason, userId } = req.body
  const { id } = req.params
  console.log(id, ">>>>>>>>")

  try {
    const report = new Report({
      reporterId: userId,
      providerId: id,
      reportReason

    })

    const b = await report.save()
    console.log(b, ")))))))))))))00")
    res.json({ message: "success", b })
  } catch (error) {
    console.log(error.message)
  }

}

const getAddress = async (req, res) => {
  const { id } = req.params

  try {
 
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addresses = user.addresses;

    res.json({ message: "success", addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

}
const addwishlist = async (req, res) => {
  try {
    console.log("dd");
    const { userId } = req.params;
    const { serviceId } = req.body;
console.log(req.body,"--------------",req.params)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wishlist.includes(serviceId)) {
      return res.status(400).json({ message: 'This service is already in your wishlist' });
    }

    user.wishlist.push(serviceId);
    await user.save();

    return res.status(200).json({ message: 'Service added to the wishlist' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




const getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('wishlist');
    console.log(user.wishlist, "#########################################################")
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching wishlist items' });
  }
}


const WalletHistory = async (req, res) => {
  const userId = req.params.userId;

  try {
 
    const walletHistory = await Wallet.find({ userId });


    res.status(200).json(walletHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch wallet history' });
  }

}



export {
  registerUser,
  getAddress,
  loginUser,
  checkNumber,
  getServices,
  getCategory,
  saveaddress,
  logoutUser,
  profileget,
  addtocart,
  profileEdit,
  getcart,
  deletecart,
  getBookings,
  userBookings,
  canceluser,
  reportProvider,
  addwishlist,
  getWishlist,
  WalletHistory,
  verifyGoogle,
  verifyFb,
  removeWishlist

}
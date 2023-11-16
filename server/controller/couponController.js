
import Coupon from "../models/couponModel.js";



const couponadd = async (req, res) => {
    try {
        const { couponName, discount } = req.body;

        const existingCoupon = await Coupon.findOne({ couponName });

        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon with this name already exists" });
        }


        const expiresIn = new Date();
        expiresIn.setDate(expiresIn.getDate() + 30);

        await Coupon.create({
            couponName,
            discount,
            expiresIn
        });

        res.json({ message: "Coupon added successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to add coupon" });
    }
};


const getcoupon = async (req, res) => {
    const coupons = await Coupon.find()
  
    res.json(coupons)
}

const editcoupon = async (req, res) => {
    const { id } = req.params
    console.log(req.body, ">>>>>>>>>>>>>>>>>>>.")
    console.log(id, ">>>")
    const coupon = await Coupon.findById(id)
    res.json(coupon)
}

const editableCoupon = async (req, ) => {
    const { id } = req.params
    console.log(req.body)
    console.log(id, "9999")
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true })
    console.log(coupon, "_________________________________________________________________________")
    await coupon.save()
    console.log("hello")
}



const deleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedCoupon = await Coupon.findByIdAndRemove(id);
        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Failed to delete coupon" });
    }

}

export {
    couponadd,
    editcoupon,
    getcoupon,
    editableCoupon,
    deleteCoupon

}
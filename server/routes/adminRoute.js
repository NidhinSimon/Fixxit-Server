import express from 'express'
import { adminLogin,addservice, allservice, editservice ,allusers, deleteservices,blockUser,unBlockUser,getReports, rejectReport,getStats,getMonths,Earnings, logout} from '../controller/adminController.js'
import {addcategory,deleteCategory,editcategory,getcategories,} from '../controller/categoryController.js'
import { couponadd, getcoupon,editcoupon ,editableCoupon,deleteCoupon} from '../controller/couponController.js'
import { protect } from '../middleware/authMiddleware.js'

const adminRoute=express.Router()

adminRoute.post('/adminlogin',adminLogin)
adminRoute.post('/add',addcategory)
adminRoute.get('/categories',getcategories)
adminRoute.post('/addservice',addservice)
adminRoute.put('/editcategory/:id',editcategory)
adminRoute.get('/services',allservice)
adminRoute.put('/editservice/:id',editservice)
adminRoute.get('/users',protect,allusers)
adminRoute.delete('/services/:id',deleteservices)
adminRoute.delete('/category/:id',deleteCategory)
adminRoute.put('/userblock/:id',blockUser)
adminRoute.put('/userunblock/:id',unBlockUser)
adminRoute.post('/coupon/add',couponadd)
adminRoute.get('/getcoupon',protect,getcoupon)
adminRoute.get('/coupon/get/:id',editcoupon)
adminRoute.put('/edit/:id',editableCoupon)
adminRoute.delete('/delete/:id',deleteCoupon)
adminRoute.get('/reports',getReports)
adminRoute.put('/updateReportStatus/:reportId',rejectReport)
adminRoute.get('/stats',getStats)
adminRoute.get('/bookings-month',getMonths)
adminRoute.post('/logout',logout)


adminRoute.get("/getmonths",Earnings)



export default adminRoute





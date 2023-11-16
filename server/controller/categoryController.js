import cloudinary from 'cloudinary'
import category from '../models/CategoryModel.js'


const addcategory = async (req, res) => {
    console.log("?entered")
    const { name, categoryimage, location } = req.body
    console.log(req.body, "??????????????????????????????????????///")
    const existingCategory = await category.findOne({ name, location });

    if (existingCategory) {
        return res.status(400).json({ message: 'Category already exists' });
    }
    try {
        if (categoryimage) {
            console.log("inside if")
            const upload = await cloudinary.v2.uploader.upload(categoryimage)
            const imageUrl = upload.url
            console.log(imageUrl, "------------------------------------------------------------------")
            const newCategory = new category({
                name,
                categoryimage: imageUrl,
                location
            })
            await newCategory.save()
            res.status(201).json({ message: 'Category added successfully' });
        } else {
            res.status(400).json({ message: 'Category image is required' });
        }




    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

const getcategories = async (req, res) => {
    try {
        const categories = await category.find()
        res.json(categories)
    } catch (error) {
        console.log(error.message)
    }
}


const editcategory = async (req, res) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..")
    try {
        const updatecategory = await category.findByIdAndUpdate(req.params.id, req.body, { new: true })
        console.log(req.params.id, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
        console.log(updatecategory, "**********************************************************")
        res.json(updatecategory)
    } catch (error) {
        res.status(500).json({ error: 'Error updating category' });
    }
}
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const service = await category.findByIdAndDelete(id)
        if (!service) {
            res.status(400).json({ message: "category not found" })
        }
        res.status(200).json({ message: "Category deleted successfully" })

    } catch (error) {
        console.log(error.message)
    }
}
export {
    addcategory,
    getcategories,
    editcategory,
    deleteCategory
}
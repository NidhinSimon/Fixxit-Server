import Admin from '../models/adminModel.js'


export const transferToAdminWallet = async (amt) => {
    try {
        const adminemail = process.env.ADMIN_EMAIL;
        const admin = await Admin.findOne({ email: adminemail });

        if (admin) {
           
            admin.Wallet += amt;
            await admin.save();

            console.log(`Admin Wallet updated: ${admin.Wallet}`);

            return admin.Wallet;
        }
    } catch (error) {
        console.log(error.message);
    }
}

export const reduceFromAdminWallet = async (amt) => {
    try {
        const adminemail = process.env.ADMIN_EMAIL;
        const admin = await Admin.findOne({ email: adminemail });

        if (admin) {
           
            admin.Wallet -= amt;
            await admin.save();

            console.log(`Admin Wallet reduced: ${admin.Wallet}`);

         
            return admin.Wallet;
        }
    } catch (error) {
        console.log(error.message);
    }
};

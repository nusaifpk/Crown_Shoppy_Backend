import jwt from "jsonwebtoken"


export const adminLogin = async (req, res) => {
    const { username, password } = req.body

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {

        const token = jwt.sign({ username }, process.env.ADMIN_ACCESS_TOKEN_SECRET)

        return res.status(200).json({
            status: "success",
            message: "admin logged in successfully",
            token: token
        })
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "invalid admin credentials...!"
        })
    }
}
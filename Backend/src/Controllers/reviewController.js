const express = require('express')
const generateReivew = require('../Services/ai.service')



const reviewCodeController = async (req,res) => {
    try {
        const { code, language } = req.body

        if (!code || !String(code).trim()) {
            return res.status(400).json({
                message: 'code is required in request body'
            })
        }

        const review = await generateReivew(code, language)

        return res.status(200).json({
            review
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to generate review',
            error: error.message
        })
    }
}

module.exports = {reviewCodeController}
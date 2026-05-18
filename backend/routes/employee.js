const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/authMiddleware');

// @desc    Search employees by department or general query
// @route   GET /api/employees/search
// @access  Private
router.get('/search', protect, async (req, res, next) => {
    try {
        const { department, query } = req.query;
        let filter = {};

        if (department) {
            filter.department = { $regex: new RegExp('^' + department + '$', 'i') };
        } else if (query) {
            // General search across name, department, skills
            filter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { department: { $regex: query, $options: 'i' } },
                    { skills: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const employees = await Employee.find(filter);
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
router.get('/', protect, async (req, res, next) => {
    try {
        const employees = await Employee.find({}).sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        next(error);
    }
});

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private
router.post('/', protect, async (req, res, next) => {
    try {
        const { name, email, department, skills, performanceScore, experience } = req.body;

        // Custom validation check for required fields (and missing performanceScore)
        if (!name || !email || !department || !skills || performanceScore === undefined || experience === undefined) {
            return res.status(400).json({ 
                message: 'Validation error: Missing required fields. Name, email, department, skills, performanceScore, and experience are all required.' 
            });
        }

        if (typeof performanceScore !== 'number' || performanceScore < 0 || performanceScore > 100) {
            return res.status(400).json({ message: 'Validation error: Performance score must be a number between 0 and 100' });
        }

        // Check duplicate email
        const employeeExists = await Employee.findOne({ email });
        if (employeeExists) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        const newEmployee = await Employee.create({
            name,
            email,
            department,
            skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
            performanceScore,
            experience
        });

        res.status(201).json(newEmployee);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error: ' + error.message });
        }
        next(error);
    }
});

// @desc    Update employee details (specifically performanceScore or other details)
// @route   PUT /api/employees/:id
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { name, email, department, skills, performanceScore, experience } = req.body;
        
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // If email is being changed, check for duplicate
        if (email && email !== employee.email) {
            const emailExists = await Employee.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Employee with this email already exists' });
            }
            employee.email = email;
        }

        if (name) employee.name = name;
        if (department) employee.department = department;
        if (skills) employee.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        if (performanceScore !== undefined) {
            if (typeof performanceScore !== 'number' || performanceScore < 0 || performanceScore > 100) {
                return res.status(400).json({ message: 'Performance score must be a number between 0 and 100' });
            }
            employee.performanceScore = performanceScore;
        }
        if (experience !== undefined) employee.experience = experience;

        const updatedEmployee = await employee.save();
        res.json(updatedEmployee);
    } catch (error) {
        next(error);
    }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await Employee.deleteOne({ _id: req.params.id });
        res.json({ message: 'Employee removed successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

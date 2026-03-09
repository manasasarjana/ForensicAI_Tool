const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).regex(/^[a-zA-Z0-9_.\-]*$/).required().messages({
    'string.pattern.base': 'Username can only contain letters, numbers, underscores, dots, and hyphens'
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters'
  }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  department: Joi.string().max(100).optional().allow(''),
  badgeNumber: Joi.string().max(20).optional().allow(''),
  role: Joi.string().valid('investigator', 'admin').optional().default('investigator')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Case validation schemas
const caseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).optional(),
  incidentDate: Joi.date().required(),
  location: Joi.string().max(200).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  suspects: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    details: Joi.string().optional()
  })).optional(),
  victims: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    details: Joi.string().optional()
  })).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// Evidence validation schemas
const evidenceSchema = Joi.object({
  caseId: Joi.string().required().messages({
    'string.empty': 'Case ID is required',
    'any.required': 'Please select a case'
  }),
  description: Joi.string().max(500).optional().allow(''),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().allow('')
});

// Report validation schemas
const reportSchema = Joi.object({
  caseId: Joi.string().required(),
  title: Joi.string().min(5).max(200).required(),
  content: Joi.object({
    executiveSummary: Joi.string().optional(),
    incidentOverview: Joi.string().optional(),
    evidenceSummary: Joi.string().optional(),
    technicalFindings: Joi.string().optional(),
    timeline: Joi.string().optional(),
    conclusion: Joi.string().optional(),
    recommendations: Joi.string().optional()
  }).optional()
});

const updateReportSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  content: Joi.object({
    executiveSummary: Joi.string().optional(),
    incidentOverview: Joi.string().optional(),
    evidenceSummary: Joi.string().optional(),
    technicalFindings: Joi.string().optional(),
    timeline: Joi.string().optional(),
    conclusion: Joi.string().optional(),
    recommendations: Joi.string().optional()
  }).optional(),
  changes: Joi.string().max(500).optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  caseSchema,
  evidenceSchema,
  reportSchema,
  updateReportSchema
};
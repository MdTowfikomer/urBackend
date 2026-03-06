module.exports = (req, res, next) => {
    const project = req.project;

    if (!project.isAuthEnabled) {
        return res.status(403).json({ 
            error: "Authentication service is disabled",
            message: "Please enable Auth in the urBackend dashboard for this project to use this endpoint."
        });
    }

    // Check if a 'users' collection schema has been defined by the developer
    const usersCollection = project.collections?.find(c => c.name === 'users');
    
    if (!usersCollection) {
        return res.status(403).json({ 
            error: "User Schema Missing",
            message: "Authentication is enabled, but the 'users' collection schema has not been defined. Please create a 'users' collection in the dashboard to define your custom user fields."
        });
    }

    // ENFORCE SCHEMA CONTRACT
    const hasEmail = usersCollection.model.find(f => f.key === 'email' && f.type === 'String' && f.required);
    const hasPassword = usersCollection.model.find(f => f.key === 'password' && f.type === 'String' && f.required);
    
    if (!hasEmail || !hasPassword) {
        return res.status(422).json({
            error: "Invalid Users Schema",
            message: "The 'users' collection is missing required 'email' and 'password' string fields. Please fix the schema in the dashboard."
        });
    }

    // Attach the usersSchema to the request so controllers can use it for dynamic validation
    req.usersSchema = usersCollection.model;
    
    next();
};

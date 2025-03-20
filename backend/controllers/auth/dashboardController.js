const getDashboardData = (req, res) => {
    try {
      // Example: Fetch user data from the decoded token
      const user = req.user; // Retrieved from authMiddleware
  
      // Sample response (replace with real data fetching logic)
      res.status(200).json({
        message: `Welcome ${user.name}!`,
        dashboardData: {
          notifications: 5,
          tasksCompleted: 10,
        },
      });
    } catch (error) {
      console.error('Dashboard Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  export default getDashboardData;
  
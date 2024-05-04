const checkUser = (collection) => {
    return async (req, res, next) => {
      if (req.body?.id && req.body?.username && req.body?.userType && req.body?.userType == "google") {
        try {
          const response = await collection.findOne({ _id: req.body.id });
          if (!response) {
            next()
          } else {
            res.status(200).send(response.authToken)
          }
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      } else
        res.status(400).send("informations required");
    };
  };
  
  export default checkUser ;
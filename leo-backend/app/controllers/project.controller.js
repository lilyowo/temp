const pool = require("../config/database");
exports.getProjectsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM "Project" WHERE "userId" = $1',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProject = async (req, res) => {
  const { userId, projectName } = req.body;
  const currentTime = new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Taipei",
  });

  try {
    const checkDuplicate = await pool.query(
      'SELECT 1 FROM "Project" WHERE "userId" = $1 AND "projectName" = $2',
      [userId, projectName]
    );
    if (checkDuplicate.rowCount > 0) {
      return res
        .status(400)
        .json({ error: "Duplicate userId and projectName pair" });
    }
    await pool.query(
      'INSERT INTO "Project" ("userId", "projectName", "lastEditTime") VALUES ($1, $2, $3)',
      [userId, projectName, currentTime]
    );
    res.status(201).json({ message: "Project added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProjectById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const deleteResult = await pool.query(
      'DELETE FROM "Project" WHERE "projectId" = $1',
      [projectId]
    );
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchProjects = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;
  try {
    let result;
    if (query) {
      result = await pool.query(
        `SELECT * FROM "Project" WHERE "userId" = $1 AND LOWER("projectName") LIKE LOWER($2)`,
        [userId, `%${query}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM "Project" WHERE "userId" = $1', [
        userId,
      ]);
    }
    if (result.rows.length === 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateLastEditTime = async (req, res) => {
  const { projectId } = req.params;
  const currentTime = new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Taipei",
  });
  try {
    const result = await pool.query(
      'UPDATE "Project" SET "lastEditTime" = $1 WHERE "projectId" = $2 RETURNING *',
      [currentTime, projectId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

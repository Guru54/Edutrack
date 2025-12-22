const Project = require('../models/Project');

// Simple keyword-based duplicate detection
const detectDuplicates = async (title, description, excludeProjectId = null) => {
  try {
    // Extract keywords from title (words longer than 3 characters)
    const keywords = title.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);

    if (keywords.length === 0) {
      return { isDuplicate: false, similarProjects: [] };
    }

    // Find projects with similar titles
    const query = {
      $or: keywords.map(keyword => ({
        title: { $regex: keyword, $options: 'i' }
      }))
    };

    if (excludeProjectId) {
      query._id = { $ne: excludeProjectId };
    }

    const similarProjects = await Project.find(query)
      .select('title description groupId status')
      .populate('groupId', 'groupName')
      .limit(10);

    // Calculate similarity percentage
    const projectsWithSimilarity = similarProjects.map(project => {
      const projectKeywords = project.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const matchingKeywords = keywords.filter(k => projectKeywords.some(pk => pk.includes(k) || k.includes(pk)));
      const similarity = (matchingKeywords.length / Math.max(keywords.length, projectKeywords.length)) * 100;

      return {
        project: {
          id: project._id,
          title: project.title,
          description: project.description,
          groupName: project.groupId?.groupName,
          status: project.status
        },
        similarity: Math.round(similarity)
      };
    });

    // Filter projects with >70% similarity
    const duplicates = projectsWithSimilarity.filter(p => p.similarity > 70);

    return {
      isDuplicate: duplicates.length > 0,
      similarProjects: duplicates,
      allSimilar: projectsWithSimilarity
    };
  } catch (error) {
    console.error('Error in duplicate detection:', error);
    throw error;
  }
};

module.exports = { detectDuplicates };

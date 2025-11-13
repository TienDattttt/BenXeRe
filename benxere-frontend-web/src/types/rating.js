/**
 * Rating response interface for historical ratings
 * @typedef {Object} Rating
 * @property {number} id - Rating ID
 * @property {number} userId - User ID who created the rating
 * @property {string} userEmail - Email of the user who created the rating
 * @property {number} busId - Bus ID associated with the rating
 * @property {string} companyName - Bus company name
 * @property {number} busOwnerId - Bus owner ID
 * @property {string} scheduleDate - Date of the schedule that was rated
 * @property {number} rating - Rating value (1-5)
 * @property {string} comment - Rating comment
 * @property {string} imageUrl - URL of the image attached to the rating (if any)
 * @property {string} createdAt - Date the rating was created
 */

/**
 * Rating response with pagination and statistics
 * @typedef {Object} RatingResponse
 * @property {Array<Rating>} content - Array of rating objects
 * @property {number} totalElements - Total number of ratings
 * @property {number} totalPages - Total number of pages
 * @property {number} averageRating - Average rating value
 * @property {number} totalRatings - Total number of ratings
 */

export const RatingTypes = {
  BUS: 'bus',
  COMPANY: 'company',
  OWNER: 'owner'
};
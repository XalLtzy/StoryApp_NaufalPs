import StoryApi from '../../data/story-api';

const AddStoryPresenter = {
  async submitStory(formData) {
    try {
      const token = localStorage.getItem('authToken');

      const base64 = formData.get('photoData');
      if (base64) {
        const photoBlob = await (await fetch(base64)).blob();
        formData.delete('photoData');
        formData.append('photo', photoBlob, 'photo.jpg');
      }

      const response = await StoryApi.addStory(formData, token);
      return response;
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  },
};

export default AddStoryPresenter;

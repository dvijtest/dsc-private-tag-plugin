import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'dsc-private-tag-plugin',
  initialize() {
    withPluginApi('0.8.18', api => {
      let currentUser = api.getCurrentUser();
      let isAdmin = currentUser && currentUser.admin;

      // We need to include the 'topic' object so that we can get the tags from it.
      api.includePostAttributes('topic');

      api.addPostTransformCallback((post) => {
        if (isAdmin && Discourse.SiteSettings.discourse_private_tag_plugin_enabled) {
          let forbiddenTags = Discourse.SiteSettings.discourse_private_tag_plugin_forbidden_tags
            .split(',')
            .map((item) => item.trim().toLowerCase());

          // Determine if the post has any of the hidden tags.
          let postTags = post.topic.tags.map((item) => item.trim().toLowerCase());
          let foundTags = forbiddenTags.filter((tag) => postTags.includes(tag));

          if (foundTags.length > 0) {
            // Hide the post for registered users.
            post.cooked = `<div class="discourse_private_tag_plugin_hidden">
                             ${Discourse.SiteSettings.discourse_private_tag_plugin_hidden_message}
                           </div>`;
          }
        }
      });
    });
  }
};

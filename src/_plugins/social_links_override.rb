## Overrides the `jekyll-socials` gem tag `{% social_links %}`.
#
# The upstream gem version currently used in this project has a bug when `custom_social.logo`
# is present: it tries to use Liquid filters (e.g. `relative_url`) inside Ruby code, which
# crashes the build.
#
# This implementation supports a small, practical subset:
# - `email`
# - `github_username`
# - `linkedin_username`
# - `scholar_userid`
# - `letterboxd_username`
# - `rss_icon`
# - `custom_social` with `logo`, `title`, `url`
#
# It also registers the same Liquid tag name (`social_links`) so it replaces the gem’s tag.

require "jekyll"

module Jekyll
  class SocialLinksOverrideTag < Liquid::Tag
    include Jekyll::Filters

    def render(context)
      @context = context
      site = context.registers[:site]
      socials = site.data["socials"]
      return "" unless socials.is_a?(Hash)

      parts = []

      socials.each do |key, value|
        case key.to_s
        when "email"
          next if value.to_s.strip.empty?
          parts << link(icon("ti ti-mail"), "mailto:#{value}", "Email")

        when "github_username"
          next if value.to_s.strip.empty?
          parts << link(icon("ti ti-brand-github"), "https://github.com/#{value}", "GitHub")

        when "linkedin_username"
          next if value.to_s.strip.empty?
          parts << link(icon("ti ti-brand-linkedin"), "https://www.linkedin.com/in/#{value}", "LinkedIn")

        when "scholar_userid"
          next if value.to_s.strip.empty?
          parts << link(icon("ai ai-google-scholar"), "https://scholar.google.com/citations?user=#{value}", "Google Scholar")

        when "letterboxd_username"
          next if value.to_s.strip.empty?
          parts << link(icon("ti ti-brand-letterboxd"), "https://letterboxd.com/#{value}/", "Letterboxd")

        when "rss_icon"
          next unless truthy?(value)
          parts << link(icon("ti ti-rss"), relative_url("/feed.xml"), "RSS")

        when "custom_social"
          next unless value.is_a?(Hash)
          url = value["url"].to_s.strip
          title = value["title"].to_s.strip
          logo = value["logo"].to_s.strip
          next if url.empty?

          if logo.empty?
            parts << link(title.empty? ? "Link" : title, url, title.empty? ? "Custom" : title)
          else
            src = logo.include?("://") ? logo : relative_url("/assets/img/#{logo}")
            alt = title.empty? ? "Custom" : title
            img = %(<img class="custom-social-icon" src="#{src}" alt="#{escape_html(alt)}">)
            parts << link(img, url, alt)
          end
        end
      end

      parts.join("\n")
    end

    private

    def truthy?(value)
      value == true || value.to_s.strip.downcase == "true"
    end

    def icon(classes)
      %(<i class="#{classes}"></i>)
    end

    def link(inner_html, href, title)
      %(<a href="#{href}" title="#{escape_html(title)}" target="_blank" rel="noopener noreferrer">#{inner_html}</a>)
    end

    def escape_html(str)
      str.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;").gsub('"', "&quot;").gsub("'", "&#39;")
    end
  end
end

Liquid::Template.register_tag("social_links", Jekyll::SocialLinksOverrideTag)

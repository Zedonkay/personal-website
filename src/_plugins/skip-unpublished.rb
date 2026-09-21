# Collection documents ignore Jekyll's post `published` flag. Drop them after
# read so unpublished project pages are omitted from output, listings, search,
# and the sitemap.
Jekyll::Hooks.register :site, :post_read do |site|
  site.collections.each_value do |collection|
    collection.docs.reject! { |doc| doc.data['published'] == false }
  end
end

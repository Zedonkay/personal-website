# jekyll-cache-bust reads files relative to the process CWD, not site.source.
# Site assets live under src/, so resolve hashes from there.
module Jekyll
  module CacheBust
    class CacheDigester
      SOURCE_ROOT = "src"

      private

      def file_content
        local_file_name = file_name.slice((file_name.index("assets/")..-1))
        File.read(File.join(SOURCE_ROOT, local_file_name))
      end

      def directory_files_content
        dir =
          if directory == "assets/_sass"
            File.join(SOURCE_ROOT, "_sass")
          else
            File.join(SOURCE_ROOT, directory)
          end
        target_path = File.join(dir, "**", "*")
        Dir[target_path].map { |f| File.read(f) unless File.directory?(f) }.join
      end
    end
  end
end

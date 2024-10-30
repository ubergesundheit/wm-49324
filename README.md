
## Development:

```
docker-compose run --rm jekyll ./convert-to-yml.rb
docker-compose run --rm jekyll jekyll build
```

# Update external dependencies (bower.json)
1. modify `bower.json`
1. modify `prepare-dependencies.sh`
1. `docker-compose run jekyll sh prepare-dependencies.sh`
1. commit vendored files

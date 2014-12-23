.SUFFIXES:

.PHONY: all dev release clean

all:
	@echo "**********************************************"
	@echo "* make dev               (development build)"
	@echo "* make release	        (production build)"
	@echo "* make clean             (remove artifacts)"
	@echo "**********************************************"


dev:
	cd frontend && gulp
	go-bindata -debug=true -prefix=frontend/dist -ignore='\.gitignore$$' frontend/dist/...
	go build -v \
		-ldflags "-X main.buildCommit `git rev-parse --short HEAD`" \
		-o keep


release:
	@cd frontend && gulp clean
	cd frontend && gulp --production
	go-bindata -prefix=frontend/dist -ignore='(\.gitignore$$|\.map$$)' frontend/dist/...
	godep go build -v \
		-ldflags "-X main.buildCommit `git rev-parse --short HEAD`" \
		-o keep


clean:
	cd frontend && gulp clean
	$(RM) keep

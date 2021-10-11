function catchAsync(f) {
    return (...args) => {
        return f(...args).catch((e) => {
            // console.log(e.response);
        });
    };
}

module.exports = catchAsync;

# Define our executable:
set(EXEC_NAME ${PROJECT_NAME})
add_executable(${EXEC_NAME} main.cpp)

# Compile options:
add_compile_options(
    # Use native WASM exception handling:
    # @link https://emscripten.org/docs/porting/exceptions.html
    -fwasm-exceptions
    # Disable setjmp-longjmp support:
    # @link https://emscripten.org/docs/porting/setjmp-longjmp.html
    -sSUPPORT_LONGJMP=0
    # These aren't necessary, but will help other tooling (e.g. clangd),
    # that doesn't know that `emcc` sets these automatically when compiling:
    -D__EMSCRIPTEN__
    -isystem${EMSCRIPTEN_SYSROOT}/include/c++/v1
    -isystem${EMSCRIPTEN_SYSROOT}/include
    # Misc options not specific to this demo:
    -stdlib=libc++
    -fPIC
    -pthread
    -ferror-limit=1000
)

# Link options:
target_link_options(
    ${EXEC_NAME}
    PUBLIC
    # We are not using a main() function:
    --no-entry
    # Enable Embind:
    -lembind
    # Prevent the WASM instance from being used after an exception is thrown,
    # to avoid calling into a WASM instance in an invalid state:
    -sABORT_ON_WASM_EXCEPTIONS=1
    # Enable if needed - can have performance side-effects:
    -sALLOW_MEMORY_GROWTH=0
    # Allow compiling unsupported code, at the cost of a runtime
    # crash if code depending on unimplemented syscalls is actually called:
    -sALLOW_UNIMPLEMENTED_SYSCALLS=1
    # Extra checks (some performance penalty):
    -sASSERTIONS=2
    -sSTACK_OVERFLOW_CHECK=2
    # Prevent use of eval() and new Function() in JS, to adhere to Cloudflare's
    # worker security policies:
    -sDYNAMIC_EXECUTION=0
    # This will be "node,worker" for development, "worker" for release:
    -sENVIRONMENT=${WASM_ENVIRONMENT}
    # We want the runtime to continue running:
    -sEXIT_RUNTIME=0
    # Allow us to import the Emscripten outputs,
    # instead having them defined as JS globals:
    -sEXPORT_ES6
    -sMODULARIZE
    # Adjust accordingly:
    -sINITIAL_MEMORY=128MB
    -sSTACK_SIZE=8MB
    # Tell Emscripten which hooks we intend to use:
    -sINCOMING_MODULE_JS_API=instantiateWasm,onAbort,onRuntimeInitialized
    # Goes without saying:
    -sWASM=1
)

# Build-type-specific options:
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(${EXEC_NAME} PUBLIC -O0 -g -gsource-map)
else()
    target_compile_options(${EXEC_NAME} PUBLIC -Os -flto=thin)
    target_link_options(${EXEC_NAME} PUBLIC --strip-all)
endif()

# Enable coroutines in older versions of clang:
if(CMAKE_CXX_COMPILER_VERSION VERSION_LESS "16")
    add_compile_options("-fcoroutines-ts")
endif()

# Make outputs available in src/gen, besides the JS entrypoints that will use them:
set(GEN_DIR "${CMAKE_CURRENT_LIST_DIR}/gen")
file(MAKE_DIRECTORY ${GEN_DIR})
foreach(FILE_EXT .js;.wasm)
    file(CREATE_LINK
        "${CMAKE_CURRENT_BINARY_DIR}/${EXEC_NAME}${FILE_EXT}"
        "${GEN_DIR}/${EXEC_NAME}${FILE_EXT}"
        SYMBOLIC
    )
endforeach()

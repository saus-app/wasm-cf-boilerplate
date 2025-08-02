cmake_minimum_required(VERSION 3.24.0)

project(WasmDemo VERSION $ENV{VERSION})
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)
set(CMAKE_CXX_EXTENSIONS Off) # Use -std=c++20 not -std=gnu++20

if(NOT CMAKE_CXX_COMPILER_ID MATCHES "Clang")
    message(FATAL_ERROR "Only Clang supported.")
endif()

add_subdirectory(src)

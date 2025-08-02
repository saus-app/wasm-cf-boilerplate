#include <cstddef>
#include <exception>
#include <string>
#include <unordered_map>

#include <emscripten.h>
#include <emscripten/bind.h>

namespace WasmDemo {

    struct HttpResponse {
        typedef std::unordered_multimap<std::string,std::string> Headers;

        uint16_t statusCode{0};
        Headers headers{};
        std::string content{};
    };

    void applyResponse (
        HttpResponse&& result,
        emscripten::val& response
    ) {
        response.set("statusCode", result.statusCode);
        auto headers{emscripten::val::global("Headers").new_()};
        for (const auto& [k, v] : result.headers) {
            headers.call<emscripten::val>("append", k, v);
        }
        response.set("headers", headers);
        response.set(
            "content",
            emscripten::val(
                emscripten::memory_view<char>(
                    result.content.size(),
                    result.content.data()
                )
            )
        );
    }
}

emscripten::val doHandleRequest (
    std::string url,
    std::string body,
    emscripten::val response
) {
    WasmDemo::HttpResponse result{
        .statusCode = 200,
        .headers{
            {"Content-Type", "text/html"},
        },
        .content{"<h1>Hello world!</h1>"},
    };
    WasmDemo::applyResponse(std::move(result), response);
    co_return true;
}

EMSCRIPTEN_BINDINGS (wasmdemo) {
    emscripten::function("doHandleRequest", &doHandleRequest);
}
// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "TaskManagerApp",
    platforms: [
        .macOS(.v12),
        .iOS(.v15)
    ],
    products: [
        .executable(
            name: "TaskManagerApp",
            targets: ["TaskManagerApp"]
        ),
    ],
    targets: [
        .executableTarget(
            name: "TaskManagerApp",
            dependencies: []
        ),
    ]
)

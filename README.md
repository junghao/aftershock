## AfterShock Calculator

Generate aftershock forecasts for earthquake events.Based on code supplied by Annemarie Christophersen

Page URL: https://junghao.github.io/aftershock/AfterShock_Beta.html

### Architecture

To do

### Input data

Uses quakesearch to get initial data which can be editted before creating a forecast

### Output - on screen

- table of calculations

### Build

Doesn't build, as such, but probably need to work out how it gets deployed.
This code currently sits in a private s3 bucket on dev, that is then accesses via CloudFront, but could probably use Fastly instead using IP restrictions to ensure GNS use only

###

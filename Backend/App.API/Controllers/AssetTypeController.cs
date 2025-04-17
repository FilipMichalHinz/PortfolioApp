namespace App.API.Controllers
{
    using App.Model.Entities;
    using App.Model.Repositories;
    using Microsoft.AspNetCore.Mvc;

    [Route("api/[controller]")]
    [ApiController]
    public class AssetTypeController : ControllerBase
    {
        protected AssetTypeRepository Repository { get; }

        public AssetTypeController(AssetTypeRepository repository)
        {
            Repository = repository;
        }

        [HttpGet]
        public ActionResult<IEnumerable<AssetType>> GetAll()
        {
            var types = Repository.GetAllAssetTypes();
            return Ok(types);
        }

        [HttpPost]
        public ActionResult Post([FromBody] AssetType type)
        {
            if (type == null)
            {
                return BadRequest("Asset type not correct");
            }

            bool status = Repository.InsertAssetType(type);
            if (status)
            {
                return Ok();
            }
            return BadRequest("Unable to insert asset type");
        }
    }
}

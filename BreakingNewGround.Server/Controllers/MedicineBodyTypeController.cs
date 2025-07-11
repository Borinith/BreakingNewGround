using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BreakingNewGround.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineBodyTypeController : GenericCrudController<MedicineBodyType>
    {
        public MedicineBodyTypeController(IGenericCrudService<MedicineBodyType> genericCrudService, ILogger<GenericCrudController<MedicineBodyType>> logger)
            : base(genericCrudService, logger)
        {
        }
    }
}
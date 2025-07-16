using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BreakingNewGround.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineTypeController : GenericCrudController<MedicineType>
    {
        public MedicineTypeController(IGenericCrudService<MedicineType> genericCrudService, ILogger<GenericCrudController<MedicineType>> logger)
            : base(genericCrudService, logger)
        {
        }
    }
}